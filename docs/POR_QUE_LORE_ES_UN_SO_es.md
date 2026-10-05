# ¿Por qué Lore es un sistema operativo para trabajar con IA?

**En una frase:** Lore organiza el criterio y el método de tu trabajo con IA; Vespi coordina operaciones acotadas bajo autoridad, deja recibos y permite continuarlas con contexto verificable.

## Qué hace un sistema operativo por ti

Un sistema operativo prepara el terreno para que las aplicaciones hagan trabajo útil: administra recursos, organiza procesos y aplica límites. Lore usa esa comparación para describir un sistema de trabajo, no un sistema operativo de computadora.

Lore Plugin aporta el terreno: tu criterio, guardado como archivos que puedes leer y corregir; el enrutamiento hacia el criterio pertinente; y el método que guía cómo se ejecuta una tarea. El criterio persistente vive en `lore/`; el estado y el plan actual viven en `FASES.md`.

Vespi es el kernel experimental de ese sistema de trabajo. Coordina una operación acotada: declara el objetivo, efecto, dueño y autoridad; deja que el host aplique sus permisos; pide una decisión humana cuando corresponde; verifica el efecto por separado; registra un recibo y conserva el estado reanudable. El recibo informa qué se observó y qué quedó sin cubrir. No demuestra por sí mismo quién autorizó ni convierte una afirmación en evidencia.

Si ya trabajas con IA y quieres mejorar tus flujos, o no quieres demorarte meses estudiando loops, tests de seguridad y QA, con Lore Plugin y Vespi puedes trabajar con ese método y esa disciplina. Puedes armar flujos para software, redacción, diseño gráfico o lo que se te ocurra; el criterio del dominio y tu juicio siguen siendo tuyos.

## Caso no técnico: preparar un documento con un diseñador

1. Tú y un diseñador acuerdan quién leerá el documento, qué decisión debe facilitar y quién aprueba el texto final. El proyecto guarda esas decisiones duraderas como criterio, y registra la etapa y los pendientes en `FASES.md`.
2. La IA usa ese criterio para proponer una estructura y un borrador. Tú y el diseñador revisan ejemplos, tono, datos y legibilidad; la revisión visual y la aprobación del documento siguen siendo decisiones humanas.
3. Si el borrador se detiene por un dato faltante, la operación deja ese punto pendiente con su dueño. No inventa el dato ni lo registra como aprobado.
4. Al día siguiente, vuelves al mismo proyecto. La sesión consulta el estado y el recibo, confirma qué sigue vigente y retoma desde el punto pendiente. Si aprendiste una regla reutilizable, `save-to-lore` la propone con evidencia y espera tu aprobación.

## Caso de software

1. Pides cambiar un formulario. El proyecto ya contiene criterios de interfaz, compatibilidad y calidad, además de su fase actual en `FASES.md`. La sesión los carga antes de decidir cómo trabajar.
2. La IA describe el cambio y una forma de comprobarlo. Si se adopta TDD, primero se escribe una prueba que falla, después el cambio mínimo y luego se vuelve a correr la prueba; este ciclo se aplica cuando el flujo y el tipo de tarea lo justifican, no se promete para cada modificación.
3. Para un paso que cruza un límite de autoridad, Vespi comprueba el permiso antes de ejecutarlo. Si falta una aprobación humana, se detiene en esa compuerta. La verificación del resultado se hace aparte de la ejecución y se registra en el recibo.
4. Una persona revisa el cambio integrado y el diff. Las pruebas automatizadas ayudan al QA, pero no sustituyen una revisión independiente ni prueban por sí solas todos los riesgos.
5. Si el trabajo queda abierto, el estado y los recibos permiten retomarlo en otra sesión. Una corrección que enseñe un criterio duradero pasa por `save-to-lore`, no se agrega automáticamente.

## Qué ocurre sin que tengas que conocer los nombres

El coordinador reconoce el tipo de trabajo, carga el criterio correspondiente y sigue las etapas pertinentes. Un agente o subagente puede recibir una tarea acotada cuando el host ofrezca esa herramienta; la coordinación revisa su entrega y verifica el artefacto antes de integrarlo. Si el host no ofrece la herramienta necesaria, la tarea queda bloqueada y se informa esa causa.

Los loops son ciclos de trabajo con una condición de salida; TDD puede ordenar una parte del trabajo de software; las pruebas de seguridad y QA añaden comprobaciones; la verificación independiente comprueba el resultado sin tomar como prueba la palabra de quien lo produjo. Lore y Vespi pueden hacer visibles estos límites dentro del flujo. No activan todas las prácticas para toda tarea ni ocultan cuándo algo está simulado, pendiente o sin verificar.

## Estado y límites

Lore Plugin 2.4.9 y el kernel Vespi 0.1.4 son un corte candidato, con fecha de publicación pendiente. La copia del kit fija el commit `13881d41cf3d9c7611eee9794bc1d9c4945a4a6e` y trae diez módulos; excluye la referencia criptográfica experimental `zk-bn254-reference.js` y el puente x402 con el SDK real. Las pruebas locales y las pasadas simuladas no son una auditoría externa; la superreview real sigue pendiente. TDD se usó con pruebas red primero para corregir defectos reproducidos en el kernel, no para afirmar que cada cambio siguió TDD.

Vespi no afirma mainnet, disponibilidad en producción, protocolo estable ni un runtime de producción. Lore Plugin y el kernel tampoco prometen que la IA siempre acierte, que los recibos sean una firma de identidad o que el sistema sustituya tu juicio. Los límites documentados del kernel 0.1.4 describen una demo verificable sin conexión externa al kernel; no confundas evidencia de una prueba concreta con preparación general para producción.

## Textos candidatos

**X:**

> Lore Plugin guarda tu criterio y organiza el método. Vespi coordina operaciones con autoridad, recibos y continuidad. Puedes trabajar con flujos de IA sin estudiar cada loop, TDD o QA. Es experimental: no afirma mainnet ni producción.

**LinkedIn:**

Si ya trabajas con IA y quieres mejorar tus flujos, Lore Plugin conserva tu criterio y organiza el método; Vespi coordina operaciones acotadas con autoridad, recibos y continuidad entre sesiones. Puedes aplicar loops, agentes, TDD y verificación en software, redacción o diseño sin tener que aprender primero toda la maquinaria. Vespi sigue siendo experimental: la superreview real está pendiente, y no afirmamos mainnet ni disponibilidad en producción.

**Notas del release:**

Lore Plugin 2.4.9 organiza criterio, enrutamiento y método para trabajar con IA. Vespi Kernel 0.1.4 añade mecanismos experimentales para operaciones acotadas bajo autoridad y continuidad por recibos; el corte candidato incluye diez módulos y excluye la referencia criptográfica experimental y el puente x402 con el SDK real. Las pruebas locales no son una auditoría externa y la superreview real está pendiente. TDD se usó en correcciones con pruebas red primero. No se afirma mainnet ni preparación para producción. Fecha de publicación pendiente.
