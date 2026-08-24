#!/usr/bin/env python3
"""Bench runner usando opencode/muse-spark en lugar de codex, mimics run.mjs behavior.
Uso:
  python bench/run_opencode.py --selftest
  python bench/run_opencode.py -n 3
  python bench/run_opencode.py --task animation-fouc -n 1
"""
import argparse, json, re, os, sys, subprocess, time, csv
from pathlib import Path

HERE = Path(__file__).parent
SUITE = None  # se resuelve en main()
TASKS_JSON = HERE / "tasks.json"
RESULTS_DIR = HERE / "results" / "opencode"
RAW_DIR = RESULTS_DIR / "raw"
CSV_PATH = RESULTS_DIR / "results.csv"
MODEL_DEFAULT = "opencode/muse-spark-1.2-contributor-free"
TIMEOUT = 300

def resolve_suite(name):
    global TASKS_JSON, RESULTS_DIR, RAW_DIR, CSV_PATH
    if name:
        if not re.match(r'^[a-z0-9-]+$', name):
            print(f'Suite inválida: "{name}"', file=sys.stderr); sys.exit(2)
        base = HERE / name
        TASKS_JSON = base / "tasks.json"
        RESULTS_DIR = base / "results"
        if name == "base":
            RESULTS_DIR = HERE / "base" / "results"
            TASKS_JSON = HERE / "base" / "tasks.json"
        else:
            RESULTS_DIR = base / "results"
    else:
        TASKS_JSON = HERE / "tasks.json"
        RESULTS_DIR = HERE / "results" / "opencode"
    RAW_DIR = RESULTS_DIR / "raw"
    CSV_PATH = RESULTS_DIR / "results.csv"
    data = json.loads(TASKS_JSON.read_text(encoding='utf-8'))
    return data["tasks"], data.get("_grade_scope","code")

def load_tasks():
    data = json.loads(TASKS_JSON.read_text(encoding='utf-8'))
    return data["tasks"], data.get("_grade_scope","code")

def code_only(text):
    blocks = re.findall(r'```[\s\S]*?```', text)
    return "\n".join(blocks) if blocks else text

def grade(task, raw, scope="code"):
    text = raw if scope=="full" else code_only(raw)
    def hit(pattern):
        m = re.match(r'^\(\?([im]+)\)', pattern)
        flags = re.MULTILINE
        pat = pattern
        if m:
            pref = m.group(1)
            if 'i' in pref: flags |= re.IGNORECASE
            pat = pattern[m.end():]
        try:
            return re.search(pat, text, flags) is not None
        except re.error as e:
            print(f"regex error {pat}: {e}", file=sys.stderr)
            return False
    compliance_hits = [p for p in task["compliance"] if hit(p)]
    violation_hits = [p for p in task["violation"] if hit(p)]
    verdict = "pass" if len(violation_hits)==0 and len(compliance_hits)==len(task["compliance"]) else "fail"
    return verdict, compliance_hits, violation_hits

def selftest(tasks, scope):
    failed=0
    for t in tasks:
        if "selftest" not in t:
            print(f"SIN SELFTEST: {t['id']}", file=sys.stderr); failed+=1; continue
        bad_verdict,_,_ = grade(t, t["selftest"]["bad"], scope)
        good_verdict,_,_ = grade(t, t["selftest"]["good"], scope)
        if bad_verdict!="fail":
            print(f"FALLA: {t['id']} da {bad_verdict} sobre su violacion", file=sys.stderr); failed+=1
        if good_verdict!="pass":
            print(f"FALLA: {t['id']} da {good_verdict} sobre su version correcta", file=sys.stderr); failed+=1
    if failed:
        print(f"\n{failed} fallo(s) en el self-check del grader.", file=sys.stderr); sys.exit(1)
    print(f"Self-check OK: {len(tasks)} tareas separan su violacion de su cumplimiento.")

def run_one(task, arm, model, suite=None):
    if suite == "base":
        fixture = HERE / "base" / "fixtures" / arm
    else:
        fixture = HERE / "fixtures" / arm
    dir_path = str(fixture)
    prompt = f"Lee CLAUDE.md completo y sigue su contrato. Ejecuta AHORA MISMO esta tarea sin pedir confirmación ni preguntar qué artefacto falta — entrega el artefacto completo directamente:\n\n{task['prompt']}"
    cmd = [
        r"C:\Users\andre\AppData\Roaming\npm\opencode.cmd",
        "run","--format","json","--dir", dir_path, "-m", model, prompt
    ]
    started = time.time()
    # capture output as bytes to avoid decode errors
    try:
        proc = subprocess.run(cmd, capture_output=True, timeout=TIMEOUT, shell=False)
        out = proc.stdout.decode('utf-8', errors='ignore')
        err = proc.stderr.decode('utf-8', errors='ignore')
        code = proc.returncode
    except subprocess.TimeoutExpired:
        return {"text":"", "error":True, "stderr":"timeout", "read_lore":False, "tool_calls":0, "cost_usd":None, "input_tokens":0,"output_tokens":0,"cache_read":0,"duration_ms":int((time.time()-started)*1000),"num_turns":0,"tools":[]}
    duration_ms = int((time.time()-started)*1000)
    events=[]
    for line in out.splitlines():
        line=line.strip()
        if not line.startswith("{"): continue
        try:
            events.append(json.loads(line))
        except: pass
    texts = [e["part"]["text"] for e in events if e.get("type")=="text" and e.get("part",{}).get("text")]
    text = "\n".join(texts)
    tools=[]
    for e in events:
        if e.get("type")=="tool_use":
            part=e.get("part",{})
            tool=part.get("tool") or part.get("type") or "unknown"
            inp=part.get("state",{}).get("input") or part.get("input") or {}
            try: s=json.dumps(inp)[:300]
            except: s=str(inp)[:300]
            tools.append(f"{tool} {s}")
    finish=None
    for e in reversed(events):
        if e.get("type")=="step_finish":
            finish=e; break
    tokens={}
    if finish:
        tokens=finish.get("part",{}).get("tokens",{})
    read_lore=any(re.search(r'lore[\\/]', t, re.I) for t in tools)
    error = (not text) or code!=0
    return {
        "text": text,
        "error": error,
        "stderr": err[-2000:],
        "read_lore": read_lore,
        "tool_calls": len(tools),
        "cost_usd": None,
        "input_tokens": tokens.get("input",0) if isinstance(tokens, dict) else 0,
        "output_tokens": tokens.get("output",0) if isinstance(tokens, dict) else 0,
        "cache_read": tokens.get("cache",{}).get("read",0) if isinstance(tokens, dict) else 0,
        "duration_ms": duration_ms,
        "num_turns": sum(1 for e in events if e.get("type")=="step_finish"),
        "tools": tools,
    }

def summary(rows):
    print("\n"+"="*64)
    for arm in ["cold","lore"]:
        a=[r for r in rows if r["arm"]==arm]
        if not a: continue
        passed=sum(1 for r in a if r["verdict"]=="pass")
        na=sum(1 for r in a if r["verdict"]=="n/a")
        mean = lambda k: sum(r[k] for r in a)/len(a) if a else 0
        line=f"{arm.ljust(5)} {passed}/{len(a)} pistas respetadas   {mean('output_tokens'):.0f} tok out   {mean('duration_ms')/1000:.0f}s"
        if na: line+=f"   ({na} n/a)"
        print(line)
    blind=sum(1 for r in rows if r["arm"]=="lore" and not r["read_lore"])
    if blind: print(f"\nAviso: {blind} corrida(s) del brazo lore nunca abrieron un archivo de lore/.")
    print(f"\n{CSV_PATH}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--selftest", action="store_true")
    parser.add_argument("--task", default=None)
    parser.add_argument("-n", "--trials", type=int, default=3)
    parser.add_argument("-m","--model", default=MODEL_DEFAULT)
    parser.add_argument("--retry-na", action="store_true")
    parser.add_argument("--regrade", action="store_true")
    parser.add_argument("--suite", default=None)
    args = parser.parse_args()
    tasks, scope = resolve_suite(args.suite)
    if args.selftest:
        selftest(tasks, scope); return
    selftest(tasks, scope)
    if args.regrade:
        # regrade existing raw
        if not RAW_DIR.exists():
            print("no raw to regrade"); return
        rows=[]
        for f in RAW_DIR.glob("*.json"):
            r=json.loads(f.read_text(encoding='utf-8'))
            task=next(t for t in tasks if t["id"]==r["task"])
            if r.get("error"):
                g_verdict="n/a"; g_c=[]; g_v=[]
            else:
                g_verdict,g_c,g_v = grade(task, r["text"], scope)
            if g_verdict!=r.get("verdict"): print(f"  {r.get('verdict')} -> {g_verdict}   {f.name}")
            r["verdict"]=g_verdict; r["compliance"]=g_c; r["violation"]=g_v
            f.write_text(json.dumps(r, ensure_ascii=False, indent=2), encoding='utf-8')
            rows.append(r)
        rows.sort(key=lambda x: (x["task"], x["arm"], x["trial"]))
        # rewrite csv
        HEAD="task,arm,trial,verdict,read_lore,compliance_hits,violation_hits,cost_usd,input_tokens,output_tokens,cache_read,tool_calls,duration_ms,num_turns\n"
        RAW_DIR.mkdir(parents=True, exist_ok=True)
        with open(CSV_PATH,"w",newline="",encoding="utf-8") as csvf:
            csvf.write(HEAD)
            for r in rows:
                csvf.write(f"{r['task']},{r['arm']},{r['trial']},{r['verdict']},{r['read_lore']},{len(r['compliance'])},{len(r['violation'])},,{r['input_tokens']},{r['output_tokens']},{r['cache_read']},{r['tool_calls']},{r['duration_ms']},{r['num_turns']}\n")
        summary(rows)
        return

    selected = [t for t in tasks if args.task is None or t["id"]==args.task]
    if not selected:
        print(f"No existe la tarea \"{args.task}\""); sys.exit(2)
    if args.task and len(selected)==0: sys.exit(2)
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    if not CSV_PATH.exists():
        CSV_PATH.write_text("task,arm,trial,verdict,read_lore,compliance_hits,violation_hits,cost_usd,input_tokens,output_tokens,cache_read,tool_calls,duration_ms,num_turns\n", encoding='utf-8')
    # build run list
    ARMS=["cold","lore"]
    runs=[]
    for task in selected:
        for arm in ARMS:
            for trial in range(1, args.trials+1):
                name=f"{task['id']}__{arm}__t{trial}.json"
                path=RAW_DIR/name
                if args.retry_na:
                    if not path.exists(): continue
                    try:
                        r=json.loads(path.read_text(encoding='utf-8'))
                        if r.get("verdict")!="n/a" and not r.get("error"): continue
                    except: pass
                    # will be overwritten via regrade path? we just rerun n/a separately
                    # for retry-na we collect only n/a files
                    # but we handle below via direct check: only include if n/a
                    # Actually we need to check if file is n/a then include
                    pass
                else:
                    if path.exists() and not args.retry_na:
                        # skip already done unless retry-na
                        # need to check if shouldRun logic: if file exists skip
                        continue
                # for retry-na, only queue n/a
                if args.retry_na:
                    if not path.exists(): continue
                    r=json.loads(path.read_text(encoding='utf-8'))
                    if r.get("verdict")!="n/a": continue
                runs.append((task, arm, trial))
    total=len(runs)
    if total==0:
        print("Nada para correr (todas las corridas ya existen). Usa --retry-na para reintentar n/a.")
        # still print summary from existing
        rows=[]
        for f in RAW_DIR.glob("*.json"):
            r=json.loads(f.read_text(encoding='utf-8'))
            rows.append(r)
        if rows:
            rows.sort(key=lambda x: (x["task"], x["arm"], x["trial"]))
            summary(rows)
        return
    print(f"Corriendo {total} corridas con {args.model} ...")
    rows=[]
    done=0
    for task, arm, trial in runs:
        t0=time.time()
        name=f"{task['id']}__{arm}__t{trial}.json"
        r=run_one(task, arm, args.model, args.suite)
        verdict, comp, viol = ("n/a", [], []) if r["error"] else grade(task, r["text"], scope)
        record={"task":task["id"],"arm":arm,"trial":trial,"model":args.model,"reasoning_effort":"medium","verdict":verdict,"compliance":comp,"violation":viol, **r}
        (RAW_DIR/name).write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding='utf-8')
        # append csv unless retry-na (then will regrade later)
        if not args.retry_na:
            with open(CSV_PATH,"a",encoding="utf-8",newline="") as cf:
                cf.write(f"{record['task']},{record['arm']},{record['trial']},{record['verdict']},{record['read_lore']},{len(comp)},{len(viol)},,{record['input_tokens']},{record['output_tokens']},{record['cache_read']},{record['tool_calls']},{record['duration_ms']},{record['num_turns']}\n")
        rows.append(record)
        done+=1
        mark="PASS" if verdict=="pass" else "fail" if verdict=="fail" else "n/a "
        lore_flag="  [no leyó el lore]" if arm=="lore" and not r["read_lore"] and verdict!="n/a" else ""
        print(f"[{done:3}/{total}] {mark}  {arm.ljust(4)} {task['id'].ljust(28)} {int(time.time()-t0)}s{lore_flag}")
    if args.retry_na:
        # regrade csv
        all_rows=[]
        for f in RAW_DIR.glob("*.json"):
            all_rows.append(json.loads(f.read_text(encoding='utf-8')))
        all_rows.sort(key=lambda x: (x["task"], x["arm"], x["trial"]))
        HEAD="task,arm,trial,verdict,read_lore,compliance_hits,violation_hits,cost_usd,input_tokens,output_tokens,cache_read,tool_calls,duration_ms,num_turns\n"
        with open(CSV_PATH,"w",encoding="utf-8",newline="") as cf:
            cf.write(HEAD)
            for r in all_rows:
                cf.write(f"{r['task']},{r['arm']},{r['trial']},{r['verdict']},{r['read_lore']},{len(r['compliance'])},{len(r['violation'])},,{r['input_tokens']},{r['output_tokens']},{r['cache_read']},{r['tool_calls']},{r['duration_ms']},{r['num_turns']}\n")
        summary(all_rows)
    else:
        # summary from this run's rows + existing? Use all rows for final summary
        all_rows=[]
        for f in RAW_DIR.glob("*.json"):
            all_rows.append(json.loads(f.read_text(encoding='utf-8')))
        all_rows.sort(key=lambda x: (x["task"], x["arm"], x["trial"]))
        summary(all_rows)

if __name__=="__main__":
    main()
