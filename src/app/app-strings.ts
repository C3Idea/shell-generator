export class AppStrings {
  static BUTTON_PARAMETERS_TITLE    = "Editar parámetros de caracol";
  static BUTTON_SAVE_IMAGE_TITLE    = "Guardar imagen";
  static BUTTON_GAME_TITLE          = "Ir al juego";
  static BUTTON_INTRO_TITLE         = "Abrir introducción";
  static BUTTON_SHELL_A_TITLE       = "Caracol predeterminado A";
  static BUTTON_SHELL_B_TITLE       = "Caracol predeterminado B";
  static BUTTON_SHELL_C_TITLE       = "Caracol predeterminado C";
  static BUTTON_SHELL_RANDOM_TITLE  = "Caracol aleatorio";
  static BUTTON_PARAM_A_TITLE       = "A";
  static BUTTON_PARAM_ALPHA_TITLE   = "alpha";
  static BUTTON_PARAM_BETA_TITLE    = "beta";
  static BUTTON_PARAM_A1_TITLE      = "a";
  static BUTTON_PARAM_B_TITLE       = "b";
  static BUTTON_PARAM_THETA_TITLE   = "theta";
  static SHOW_WIREFRAME_TEXT = "Mostrar esqueleto";
  static SURFACE_TEXT        = "Caracol";
  static SURFACE_COLOR_INPUT_HELP_TEXT   = "Cambiar color de caracol";
  static WIREFRAME_COLOR_INPUT_HELP_TEXT = "Cambiar color de esqueleto";
  static WIREFRAME_TEXT      = "Esqueleto";
  static VISUALIZATION_MENU_BUTTON_HELP_TEXT = "Editar parámetros de visualización";
  static QUAL_TEXT           = "Resolución";
  static PARAMETER_QUAL_BUTTON_HELP_TEXT = "Calidad";
  static BUTTON_SANDBOX_TITLE = "Ir al sandbox";
  static BUTTON_HOW_TO_TITLE  = "Abrir instrucciones del juego";
  static BUTTON_NEW_GAME_TITLE = "Iniciar juego nuevo";
  static BUTTON_SHARE_GAME_TITLE = "Copiar enlace para retar con el caracol objetivo";
  static LABEL_NEW_GAME = "Nuevo juego";
  static LABEL_SHARE_GAME = "Compartir";
  static LABEL_DISTANCE_BAR = "Qué tan cerca estás del objetivo";
  static LABEL_LINK_COPIED = "Enlace copiado al portapapeles.";
  static LABEL_LINK_PROMPT = "Comparte este enlace";
  static LABEL_INTRO_WELCOME_TEXT = "¡Bienvenido!";
  // Welcome pop-up (#3). LINE2 introduces the equation shown right after it.
  static LABEL_INTRO_LINE1 = "Los caracoles y las conchas tienen formas muy distintas, pero todos crecen siguiendo las mismas reglas.";
  static LABEL_INTRO_LINE2 = "Con matemáticas podemos describir esas reglas en una sola ecuación:";
  static LABEL_INTRO_LINE4 = "Mueve los sliders y diseña todos los caracoles que imagines.";
  static LABEL_INTRO_LINE5 = "¿Listo para el siguiente nivel? En el modo juego te retamos a reconstruir un caracol ¿te\u00a0animas?";  // no-break space: "¿te animas?" stays on one line
  // What a screen reader reads instead of the MathML (#3, D7).
  static LABEL_INTRO_EQUATION_ALT      = "C de theta y s es igual a H de theta más E de theta y s. H de theta, la espiral, es A por e elevado a theta por cotangente de alfa, por el vector: seno de beta por coseno de theta, seno de beta por seno de theta, menos coseno de beta. E de theta y s, la elipse, es e elevado a theta por cotangente de alfa, por r sub e de s, por el vector: coseno de s por coseno de theta, coseno de s por seno de theta, seno de s. r sub e de s es 1 entre la raíz cuadrada de: coseno al cuadrado de s entre a al cuadrado, más seno al cuadrado de s entre b al cuadrado.";
  static LABEL_INTRO_EQUATION_FULL_ALT = "La ecuación completa también gira la elipse con los ángulos phi, omega y mu. x es igual a: A por seno de beta por coseno de theta, más r sub e de s por coseno de la suma de s y phi por coseno de la suma de theta y omega, menos r sub e de s por seno de la suma de s y phi por seno de mu por seno de la suma de theta y omega; todo por e elevado a theta por cotangente de alfa. y es igual a: A por seno de beta por seno de theta, más r sub e de s por coseno de la suma de s y phi por seno de la suma de theta y omega, más r sub e de s por seno de la suma de s y phi por seno de mu por coseno de la suma de theta y omega; todo por e elevado a theta por cotangente de alfa. z es igual a: menos A por coseno de beta, más r sub e de s por seno de la suma de s y phi por coseno de mu; todo por e elevado a theta por cotangente de alfa.";
  static LABEL_INTRO_EQUATION_SHOW = "Ver ecuación completa";
  static LABEL_INTRO_EQUATION_HIDE = "Ocultar ecuación completa";
  static LABEL_INTRO_MORE      = "Conoce más";
  static LABEL_INTRO_MORE_ARIA = "Conoce más sobre el modelo en Atractor (se abre en una pestaña nueva)";
  static LABEL_INTRO_MORE_URL  = "https://www.atractor.pt/mat/conchas/texto1-_en.html";
  static LABEL_INTRO_START     = "Comenzar";
  static LABEL_PARAM_A_HELP_TITLE = "Parámetro A (amplitud inicial del espiral)";
  static LABEL_PARAM_A_HELP_CONTENT = "Este parámetro controla la apertura inicial del espiral que guía el crecimiento del caracol.";
  static LABEL_PARAM_ALPHA_HELP_TITLE = "Parámetro alpha (ángulo del espiral)";
  static LABEL_PARAM_ALPHA_HELP_CONTENT = "Este parámetro controla que tan cerrado o abierto es el ángulo del espiral que guía el crecimiento del caracol.";
  static LABEL_PARAM_BETA_HELP_TITLE = "Parámetro beta (ángulo con el eje zeta)";
  static LABEL_PARAM_BETA_HELP_CONTENT = "Este parámetro controla el ángulo vertical con el que crece el caracol.";
  // a scales cos s (horizontal), b scales sin s (vertical); the θ slider
  // counts half-turns (#3).
  static LABEL_PARAM_A1_HELP_TITLE = "Parámetro a (eje horizontal de la elipse)";
  static LABEL_PARAM_A1_HELP_CONTENT = "Este parámetro controla el tamaño del eje horizontal de la elipse que le da forma al caracol.";
  static LABEL_PARAM_B_HELP_TITLE = "Parámetro b (eje vertical de la elipse)";
  static LABEL_PARAM_B_HELP_CONTENT = "Este parámetro controla el tamaño del eje vertical de la elipse que le da forma al caracol.";
  static LABEL_PARAM_THETA_HELP_TITLE = "Parámetro theta (medias vueltas)";
  static LABEL_PARAM_THETA_HELP_CONTENT = "Este parámetro controla cuántas medias vueltas da el caracol.";
  static LABEL_PARAM_QUAL_TITLE   = "Resolución";
  static LABEL_PARAM_QUAL_CONTENT = "Este parámetro controla el número de rectángulos que se usan para aproximar la superficie del caracol.";
  // Parameter names shown next to their icons in the shell panel (#6).
  static LABEL_PARAM_NAME_A     = "A";
  static LABEL_PARAM_NAME_ALPHA = "α";
  static LABEL_PARAM_NAME_BETA  = "β";
  static LABEL_PARAM_NAME_A1    = "a";
  static LABEL_PARAM_NAME_B     = "b";
  static LABEL_PARAM_NAME_THETA = "θ";
  static LABEL_HOWTO_WINDOW_TITLE = "¡Bienvenido al juego!";
  // The how-to in short sections (#10). Parámetros, Usuario / Objetivo and
  // Progreso take their titles from the "?" guide (GUIDE_GAME_*_TITLE).
  static LABEL_HOWTO_GOAL = "Te mostramos un caracol objetivo. ¿Puedes reconstruirlo?";
  // The gear sits between two strings so screen readers can read it as
  // "Parámetros"; U+FE0E keeps phones from drawing it as a colour emoji.
  static LABEL_HOWTO_PARAMETERS_BEFORE = "Abre";
  static LABEL_HOWTO_GEAR              = "⚙︎";
  static LABEL_HOWTO_PARAMETERS_AFTER  = "y mueve los sliders para cambiar tu caracol.";
  static LABEL_HOWTO_SWITCH   = "Cambia la vista entre tu caracol (blanco) y el objetivo (dorado).";
  static LABEL_HOWTO_PROGRESS = "La barra avanza hacia ✓ mientras más te acercas. Cuando tu caracol sea casi idéntico, ¡ganas!";
  static LABEL_HOWTO_NEW_GAME_SHARE_TITLE = "Nuevo juego y Compartir";
  static LABEL_HOWTO_NEW_GAME_SHARE       = "Empieza otra partida, o copia el enlace para retar a alguien con el caracol objetivo.";
  static LABEL_HOWTO_WHERE_TITLE = "¿Dónde está cada cosa?";
  static LABEL_HOWTO_WHERE       = "Toca ? para verlo en la pantalla.";
  static LABEL_HOWTO_CLOSING = "¡Suerte y diviértete!";
  static LABEL_HOWTO_PLAY    = "¡A jugar!";
  static LABEL_CLOSE = "Cerrar";
  static LABEL_USER  = "Usuario";
  static LABEL_TARGET = "Objetivo";
  static LABEL_SUCCESS = "¡Victoria!";
  static LABEL_GO_HOME = "Sandbox";
  static LABEL_PLAY_AGAIN = "Jugar";
  static LABEL_NEW_GAME_POPUP_TITLE = "Nuevo juego";
  static LABEL_RANDOM_GAME = "Aleatorio";
  static LABEL_ENTER_KEY   = "Introducir clave";
  static LABEL_GAME_KEY    = "Clave de juego";
  static LABEL_START_KEYED_GAME = "Jugar";
  static PLACEHOLDER_GAME_KEY = "Escribe una clave";
  // The guide (#5): the "?" button and a callout per control on the initial
  // screen. Wording approved by the owner on #5 (2026-09-29).
  static BUTTON_HELP_TITLE = "Mostrar ayuda";
  static GUIDE_PARAMETERS_TITLE    = "Parámetros";
  static GUIDE_PARAMETERS_TEXT     = "Controla la forma del caracol.";
  static GUIDE_SAVE_IMAGE_TITLE    = "Guardar imagen";
  static GUIDE_SAVE_IMAGE_TEXT     = "Descarga el caracol como PNG.";
  static GUIDE_GAME_TITLE          = "Juego";
  static GUIDE_GAME_TEXT           = "Juega a reconstruir un caracol objetivo.";
  static GUIDE_INTRO_TITLE         = "Bienvenida";
  static GUIDE_INTRO_TEXT          = "Las matemáticas que dan forma a los caracoles.";
  static GUIDE_HELP_TITLE          = "Ayuda";
  static GUIDE_HELP_TEXT           = "Toca de nuevo para cerrar.";
  static GUIDE_VIEW_TITLE          = "Vista 3D";
  static GUIDE_VIEW_TEXT           = "Arrastra para girar; rueda o pellizca para acercar.";
  static GUIDE_VISUALIZATION_TITLE = "Apariencia";
  static GUIDE_VISUALIZATION_TEXT  = "Resolución, esqueleto y colores.";
  // The game's guide (#35). The "?" and the camera reuse the initial
  // screen's GUIDE_* strings above.
  static GUIDE_GAME_PARAMETERS_TITLE = "Parámetros";
  static GUIDE_GAME_PARAMETERS_TEXT  = "Ajusta tu caracol para acercarlo al objetivo.";
  static GUIDE_GAME_HOME_TITLE       = "Inicio";
  static GUIDE_GAME_HOME_TEXT        = "Vuelve a la pantalla inicial.";
  static GUIDE_GAME_HOWTO_TITLE      = "Cómo jugar";
  static GUIDE_GAME_HOWTO_TEXT       = "Abre las instrucciones del juego.";
  static GUIDE_GAME_SWITCH_TITLE     = "Usuario / Objetivo";
  static GUIDE_GAME_SWITCH_TEXT      = "Tu caracol (blanco) o el objetivo (dorado).";
  static GUIDE_GAME_HEAT_TITLE       = "Progreso";
  static GUIDE_GAME_HEAT_TEXT        = "Qué tan cerca estás del objetivo.";
  static GUIDE_GAME_NEW_GAME_TITLE   = "Nuevo juego";
  static GUIDE_GAME_NEW_GAME_TEXT    = "Empieza otra partida, al azar o con una clave.";
  static GUIDE_GAME_SHARE_TITLE      = "Compartir";
  static GUIDE_GAME_SHARE_TEXT       = "Copia el enlace con el caracol que estás adivinando, reta a alguien más.";
}
