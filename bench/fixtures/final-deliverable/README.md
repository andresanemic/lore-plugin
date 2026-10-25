# Fixtures sintéticos — salidas finales (L2 de 2.5.3)

Todo lo que hay en esta carpeta es **sintético**: lo escribió el banco de pruebas y no copia
ningún encargo, fuente ni entrega de un proyecto real (R-02).

- `encargo.md`: el encargo sintético de una operación de tres notas y una síntesis.
- `fuentes/nota-fuente.md`: la única fuente declarada por ese encargo.
- `expected/judge-answer.txt`: la respuesta esperada del juez ciego. Vive **fuera** de la raíz de
  la operación en todas las pruebas; su marcador no puede aparecer en el paquete que recibe el
  juez (L2-15).
