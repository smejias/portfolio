# Portfolio de Santi Mejías, v1

Sitio estático de varias páginas. No necesita instalar nada ni un servidor con base de datos: son archivos que se suben a cualquier hosting.

## Qué hay en la carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Home: hero, trabajos, case study destacado, tabla de títulos, school work, testimonios |
| `forgotten-runiverse.html`, `civ-royale.html`, `frozen-adventures.html` | Una página por proyecto |
| `into-the-wild.html` | Case study (antes `into-the-wil-case-study`, con el typo corregido) |
| `school-work.html` | Proyectos de la facultad (Image Campus), separados del trabajo profesional |
| `about.html`, `contact.html`, `404.html` | Sobre mí, contacto y página de error |
| `assets/css/style.css` | Todo el diseño. Los colores y tipografías están al principio, como variables |
| `assets/js/main.js` | Animaciones, tema claro/oscuro, botón de copiar mail y visor de imágenes |
| `assets/img/` | Acá van tus imágenes (ver más abajo) |
| `assets/Santiago-Mejias-CV.pdf` | Tu CV en PDF, con el que enlazan los botones "Download CV". Para cambiarlo, reemplazá el archivo por otro con el mismo nombre |

## 1. Verlo en tu computadora

Abrí una terminal en esta carpeta y ejecutá `python3 -m http.server 8000`. Después entrá a http://localhost:8000. También podés abrir `index.html` con doble clic, pero algunos navegadores limitan cosas en ese modo.

## 2. Qué completar antes de publicar

Lo que falta se ve en el sitio como recuadros punteados ("Image slot"). Ninguno de estos datos lo inventé.

- [ ] **Imágenes.** Tabla en la sección 3. Mientras falten, el sitio muestra el recuadro con el nombre del archivo esperado.
- [ ] **Estado de cada juego.** Los tres proyectos dicen "Retired 2026". Si querés más precisión (servidores apagados, retirado de las tiendas), cambialo en la home y en la ficha de cada proyecto.
- [ ] **Case study, "Key design decisions".** Las cuatro tarjetas las armé con lo que ya escribís en el resto del case study, porque en el Wix esa sección era una sola imagen. Revisalas. Podés subir tu imagen original o borrar ese recuadro.
- [ ] **Diagramas de "Into the Wild".** El mapa animado lo redibujé con la estructura que ya contás. Tu borrador original va en `into-the-wild-draft` con su leyenda ("Illustrative only").
- [ ] **Frozen Adventures.** Usá capturas propias o aprobadas. Evitá el arte oficial de Disney.
- [ ] **Sección "On the desk" (prototipos en Godot).** Está oculta. Cuando tengas algo para mostrar, en `index.html` buscá `id="prototypes"` y borrá el atributo `hidden`.
- [ ] **School Work.** Elegí los proyectos de la facultad que querés mostrar y completá los recuadros marcados "Fill in" en `school-work.html` (y las tres tarjetas de la home, en `index.html` bajo `id="school"`).
- [ ] **Videos de la comunidad.** Son de terceros y pueden desaparecer. Avisá a los autores y sumá su nombre si querés darles crédito.

## 3. Imágenes

Guardalas en `assets/img/` con estos nombres exactos. Sirven `.jpg`, `.png`, `.webp`, `.jpeg` o `.avif` y el sitio prueba cada extensión solo. Para que carguen rápido, exportalas a esa medida y comprimidas (menos de 300 KB cada una, en Squoosh.app o similar). Las medidas son las que se ven nítidas en pantallas de alta densidad.

La última columna apunta a la imagen original que tenés en el Wix, para que la bajes de ahí mientras siga publicado.

| Archivo | Página | Medida sugerida | Qué va | Origen |
|---|---|---|---|---|
| `santi-portrait.jpg` | index.html | 1000 × 1250 px | Your portrait, 4:5, at least 900 px wide | [original en Wix](https://static.wixstatic.com/media/fda098_02693df8adea4f3392c3dda167fa219a~mv2.jpg) |
| `forgotten-runiverse-cover.jpg` | index.html | 1600 × 1000 px | Key art or in-game shot of Forgotten Runiverse | [original en Wix](https://static.wixstatic.com/media/fda098_f99a0c4b857b461b938f267a9138c66b~mv2.png) |
| `civ-royale-cover.jpg` | index.html | 1600 × 1000 px | Key art or in-game shot of Civ Royale | [original en Wix](https://static.wixstatic.com/media/fda098_e6fd2756482a4f7c8a422efb619a9fd2~mv2.jpg) |
| `frozen-adventures-cover.jpg` | index.html | 1600 × 1000 px | Own material or approved screens only (avoid Disney key art) | — |
| `prototype-1.jpg` | index.html | 1600 × 1000 px | GIF or screenshot of the prototype | — |
| `santi-about.jpg` | about.html | 1000 × 1250 px | A second portrait, 4:5, at least 900 px wide | [original en Wix](https://static.wixstatic.com/media/fda098_ddf9bfef14fc437fab445f1e77355328~mv2.jpg) |
| `civ-royale-1.jpg` | civ-royale.html | 1600 × 900 px | Screenshot 1 of 6 | [original en Wix](https://static.wixstatic.com/media/fda098_f75f6658f712443eaedf3d44fa74e328~mv2.png) |
| `civ-royale-2.jpg` | civ-royale.html | 1600 × 900 px | Screenshot 2 of 6 | [original en Wix](https://static.wixstatic.com/media/fda098_981ea3ef1e7b4f17aea580a774dd4436~mv2.png) |
| `civ-royale-3.jpg` | civ-royale.html | 1600 × 900 px | Screenshot 3 of 6 | [original en Wix](https://static.wixstatic.com/media/fda098_fa5e1960f3ec4e05af1c061d60ec23cb~mv2.jpg) |
| `civ-royale-4.jpg` | civ-royale.html | 1600 × 900 px | Screenshot 4 of 6 | [original en Wix](https://static.wixstatic.com/media/fda098_34a558e143ca4c5eaae993d8d6bc08eb~mv2.jpg) |
| `civ-royale-5.jpg` | civ-royale.html | 1600 × 900 px | Screenshot 5 of 6 | [original en Wix](https://static.wixstatic.com/media/fda098_b3291b7e38094ae2895ae48364b54657~mv2.jpg) |
| `civ-royale-6.jpg` | civ-royale.html | 1600 × 900 px | Screenshot 6 of 6 | [original en Wix](https://static.wixstatic.com/media/fda098_e9efecfeb6a5485aa1455d69699706be~mv2.jpg) |
| `frozen-adventures-1.jpg` | frozen-adventures.html | 1600 × 900 px | Sample 1 of 4 | [original en Wix](https://static.wixstatic.com/media/fda098_43a6af1848d84824bd5a5a6c543e0695~mv2.jpg) |
| `frozen-adventures-2.jpg` | frozen-adventures.html | 1600 × 900 px | Sample 2 of 4 | [original en Wix](https://static.wixstatic.com/media/fda098_28d6a32d6f3b42c1b969d2aea406d76b~mv2.jpg) |
| `frozen-adventures-3.jpg` | frozen-adventures.html | 1600 × 900 px | Sample 3 of 4 | [original en Wix](https://static.wixstatic.com/media/fda098_f65573403da84dfcb5503ee9da497faf~mv2.jpg) |
| `frozen-adventures-4.jpg` | frozen-adventures.html | 1600 × 900 px | Sample 4 of 4 | — |
| `into-the-wild-1.jpg` | into-the-wild.html | 1440 × 782 px | Opening image of the case study | [original en Wix](https://static.wixstatic.com/media/fda098_84a68a052b2e466ea1fe292a06ea0369~mv2.png) |
| `into-the-wild-2.jpg` | into-the-wild.html | 1200 × 818 px | Quest icon or in-game shot | [original en Wix](https://static.wixstatic.com/media/fda098_d9c2db84c65e47bfbf85d777f180aacc~mv2.webp) |
| `into-the-wild-draft.jpg` | into-the-wild.html | 800 × 2150 px (imagen alta) | Early draft of the interaction structure | [original en Wix](https://static.wixstatic.com/media/fda098_7dc1d8c1a0364959897795fd195127fb~mv2.jpg) |
| `into-the-wild-3.jpg` | into-the-wild.html | 1440 × 678 px | Image from the hidden layer section | [original en Wix](https://static.wixstatic.com/media/fda098_f2163c60c1294e2e8f4fc2b703dc1157~mv2.png) |
| `into-the-wild-decisions.jpg` | into-the-wild.html | 1676 × 488 px | Your original Key Design Decisions image (optional) | [original en Wix](https://static.wixstatic.com/media/fda098_035175f6842a43bc86e1f40278e904b9~mv2.png) |
| `school-project-1.jpg` | school-work.html | 1600 × 900 px | Screenshot or GDD page | — |
| `school-project-2.jpg` | school-work.html | 1600 × 900 px | Screenshot, GDD page or build footage | — |
| `school-project-3.jpg` | school-work.html | 1600 × 900 px | Screenshot, GDD page or build footage | — |

Una imagen que carga bien se puede ampliar con un clic (visor incluido).

## 4. Publicar

Cualquiera de estas tres opciones es gratis para un portfolio. Los nombres de menús cambian de vez en cuando, así que seguí las instrucciones de cada servicio.

1. **Cloudflare Pages** (recomendada si comprás el dominio en Cloudflare). Creá una cuenta, andá a Workers & Pages, elegí "Pages" y subí la carpeta con "Direct Upload".
2. **Netlify.** Entrá a `app.netlify.com/drop` y arrastrá la carpeta.
3. **GitHub Pages.** Subí los archivos a un repositorio y activá Pages en Settings. Sirve si querés que cada cambio se publique al hacer push.

Las tres muestran `404.html` cuando alguien entra a una dirección que no existe.

## 5. Dominio propio

1. Buscá el dominio (por ejemplo `santiagomejias.com` o `santimejias.design`) en Cloudflare Registrar, Namecheap o Porkbun. Un `.com` ronda los USD 10–15 por año. Un `.com.ar` es más barato pero lo gestiona NIC Argentina y tiene requisitos propios.
2. En el servicio de hosting, agregá el dominio desde "Custom domains" (Cloudflare) o "Domain management" (Netlify) y seguí los pasos de DNS que te indica.
3. El certificado HTTPS se activa solo, puede tardar unos minutos.
4. Cuando el sitio nuevo funcione en tu dominio, actualizá el link en LinkedIn y en tu CV, y recién ahí dá de baja el Wix.

Después de tener el dominio, conviene agregar una imagen de vista previa (`og:image`) para cuando compartas el link en LinkedIn o WhatsApp. Necesita la dirección final, por eso no está en esta versión.

## 6. Mantenimiento

- **Cambiar un texto:** abrí el `.html` en cualquier editor (VS Code, por ejemplo), buscá el texto y reemplazalo.
- **Agregar un proyecto:** duplicá `civ-royale.html`, cambiá el contenido y agregá una tarjeta en la home. Pedime que lo haga y te devuelvo los archivos actualizados.
- **Cambiar la paleta:** están las variables al inicio de `style.css`: `--accent` (azul, para resaltados y notas), `--action` (naranja, para enlaces y botones), `--paper` y `--ink`.
- **Volver a subir:** repetí el paso 4 con la carpeta actualizada.

## 7. Notas técnicas

- El diseño se adapta a celular, tablet y escritorio, y tiene modo claro y oscuro (sigue la preferencia del sistema y hay un botón).
- **Alineación con los renglones del fondo.** La celda del fondo mide `--u` (28 px, al inicio de `style.css`). Los textos sobre el papel tienen interlineado de una celda y los espacios entre bloques son múltiplos de `--u`. `main.js` (sección "Rhythm") redondea la altura de tarjetas, imágenes y diagramas a celdas enteras y apoya la línea base de cada texto justo sobre su renglón. Se recalcula sola al cargar las fuentes y al cambiar el tamaño de la ventana.
  - Si agregás bloques nuevos, usá múltiplos de `var(--u)` en márgenes, paddings y separaciones (`calc(var(--u) * 2)`, por ejemplo). Si cambiás `--u`, todo se reacomoda.
  - Quedan fuera de la regla los textos dentro de tarjetas, botones y etiquetas (tienen fondo sólido y tapan las líneas) y las notas manuscritas inclinadas, que están así a propósito.
  - Sin JavaScript el sitio se ve bien, pero los textos quedan unos 8 px por encima de cada renglón.
- Las animaciones se desactivan solas si el visitante tiene activada la opción "reducir movimiento".
- Las tipografías (Young Serif, Figtree, JetBrains Mono y Caveat) se cargan desde Google Fonts. Si preferís evitar esa dependencia, se pueden alojar en la propia carpeta.
- No hay cookies, analytics ni formulario. El contacto es por mail (con botón para copiarlo), LinkedIn y tu calendario. Si querés un formulario, Formspree o Netlify Forms se agregan en unos minutos.
- La única librería externa es la de fuentes. El JavaScript propio pesa pocos KB.
