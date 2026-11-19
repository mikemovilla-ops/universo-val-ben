import Link from "next/link";

// Instrucciones paso a paso, en lenguaje sencillo (pensadas sobre todo para
// papá y mamá). Cada sección tiene un ancla para enlazarla desde los
// recuadros "¿Cómo funciona esto?" de cada página.
function Seccion({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} className="card p-5 space-y-3 scroll-mt-4">
      <h2 className="font-display text-2xl">{titulo}</h2>
      <div className="space-y-3 text-crema/85 leading-relaxed">{children}</div>
    </section>
  );
}

function Pasos({ children }: { children: React.ReactNode }) {
  return <ol className="list-decimal list-outside pl-6 space-y-2">{children}</ol>;
}

export default function Ayuda() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <h1 className="font-display text-3xl">❓ Cómo funciona</h1>
      <p className="text-crema/70">
        Universo Val-Ben tiene tres apartados: <strong>Familia</strong>, <strong>Recetas</strong> y <strong>Álbum</strong>. En
        el móvil están en la barra de abajo; en el ordenador, arriba.
      </p>

      <nav className="flex flex-wrap gap-2 text-sm">
        {[
          ["#entrar", "Entrar"],
          ["#iphone", "Ponerla en el iPhone"],
          ["#familia", "Familia"],
          ["#recetas", "Recetas"],
          ["#album", "Álbum"],
          ["#datos", "Mis datos"],
        ].map(([href, t]) => (
          <a key={href} href={href} className="rounded-full border border-crema/15 px-3 py-1.5 hover:bg-crema/10">
            {t}
          </a>
        ))}
      </nav>

      <Seccion id="entrar" titulo="🔑 Entrar">
        <Pasos>
          <li>
            Pulsa <strong>«Entrar con Google»</strong> y elige tu cuenta de Gmail.
          </li>
          <li>Solo funciona con el email que tenga apuntado el administrador. Si no te deja, díselo.</li>
          <li>No hace falta volver a entrar cada vez: la app se acuerda de ti.</li>
        </Pasos>
      </Seccion>

      <Seccion id="iphone" titulo="📱 Ponerla como una app en el móvil">
        <p>
          <strong>iPhone:</strong>
        </p>
        <Pasos>
          <li>Abre la app en <strong>Safari</strong>.</li>
          <li>
            Pulsa el botón de <strong>compartir</strong> (el cuadrado con una flecha hacia arriba, abajo en el centro).
          </li>
          <li>
            Baja y pulsa <strong>«Añadir a pantalla de inicio»</strong>, y luego <strong>«Añadir»</strong>.
          </li>
          <li>Ya tienes el icono de la familia en tu pantalla, como cualquier otra app.</li>
        </Pasos>
        <p>
          <strong>Android:</strong> en Chrome, pulsa los tres puntos de arriba a la derecha y elige{" "}
          <strong>«Añadir a pantalla de inicio»</strong> (o «Instalar aplicación»).
        </p>
      </Seccion>

      <Seccion id="familia" titulo="🌳 Familia">
        <p>Aquí está el árbol con todos: arriba los mayores y abajo los pequeños. Las líneas unen a padres con hijos y el ♥ a las parejas.</p>
        <Pasos>
          <li>Toca a cualquiera para ver su <strong>ficha</strong>: fecha de nacimiento, teléfono, su familia, hitos, anécdotas y las fotos en las que sale.</li>
          <li>
            Desde la ficha puedes <strong>llamarle</strong> o escribirle por <strong>WhatsApp</strong> con un toque.
          </li>
          <li>Si el árbol no cabe en la pantalla del móvil, deslízalo de lado con el dedo.</li>
        </Pasos>
        <h3 className="font-display text-lg pt-2">⭐ Hitos, anécdotas y curiosidades</h3>
        <p>
          En la ficha de tus hijos (y de tus nietos) puedes apuntar cosas de su vida. Ya hay una lista de hitos preparada
          (primera palabra, cuándo aprendió a nadar, a montar en bici…): solo tienes que pulsar <strong>«Rellenar»</strong> y
          escribir cuándo fue, como lo recuerdes («con 6 años», «verano del 95»…).
        </p>
        <Pasos>
          <li>Abre la ficha de tu hijo o hija.</li>
          <li>
            En <strong>Hitos</strong>, pulsa <strong>«Rellenar»</strong> al lado del que quieras, escríbelo y pulsa{" "}
            <strong>«Guardar»</strong>.
          </li>
          <li>
            ¿Falta alguno? Abajo del todo, <strong>«Añadir otro hito»</strong>.
          </li>
          <li>
            Para contar una historia, en <strong>Anécdotas y curiosidades</strong> pulsa <strong>«Añadir anécdota o curiosidad»</strong>.
          </li>
        </Pasos>
        <p className="text-sm text-crema/60">
          Cada uno puede rellenar lo suyo, y los padres y abuelos lo de sus hijos y nietos. Añadir personas nuevas al árbol lo hace el administrador.
        </p>
      </Seccion>

      <Seccion id="recetas" titulo="🍲 Recetas">
        <p>Las recetas pasan por tres listas:</p>
        <ul className="space-y-1.5">
          <li>📋 <strong>Pedidas</strong>: alguien la ha pedido y nadie la ha empezado.</li>
          <li>✍️ <strong>Escribiéndose</strong>: papá o mamá la está escribiendo.</li>
          <li>✅ <strong>Listas</strong>: terminada, lista para cocinar.</li>
        </ul>
        <h3 className="font-display text-lg pt-2">Para pedir una receta (hijos)</h3>
        <Pasos>
          <li>
            Ve a <strong>Recetas</strong> y pulsa <strong>«Pedir una receta»</strong>.
          </li>
          <li>Escribe qué receta quieres y, si quieres, algún detalle.</li>
          <li>Papá y mamá reciben un email. Cuando la terminen, te llega otro a ti.</li>
        </Pasos>
        <h3 className="font-display text-lg pt-2">Para escribir una receta (papá y mamá)</h3>
        <Pasos>
          <li>
            Ve a <strong>Recetas</strong>: verás primero las <strong>Pedidas</strong>. Toca la que quieras.
          </li>
          <li>
            Pulsa <strong>«Empezar a escribirla»</strong>.
          </li>
          <li>
            Escribe los <strong>ingredientes</strong>, uno por línea (la cantidad a la izquierda, el ingrediente a la derecha).
            Para añadir más, <strong>«Añadir ingrediente»</strong>.
          </li>
          <li>
            Escribe los <strong>pasos</strong>, uno por recuadro, como si se lo contaras a alguien en la cocina. Puedes poner una
            foto en cada paso con <strong>«Foto de este paso»</strong>.
          </li>
          <li>
            ¿No te da tiempo a terminar? Pulsa <strong>«Guardar y seguir luego»</strong>. Otro día entras en la receta y pulsas{" "}
            <strong>«Seguir escribiéndola»</strong>.
          </li>
          <li>
            Cuando esté completa, pulsa <strong>«Terminada»</strong>. Pasa a Listas y avisamos a los hijos.
          </li>
        </Pasos>
        <p>
          También podéis escribir una receta que nadie ha pedido con <strong>«Escribir una receta nueva»</strong>.
        </p>
        <h3 className="font-display text-lg pt-2">🔍 Buscar</h3>
        <p>
          Escribe en el buscador el nombre o un ingrediente (por ejemplo «lentejas» o «bacalao»). Da igual poner tildes o
          mayúsculas.
        </p>
        <p className="text-sm text-crema/60">Mientras cocinas, puedes tocar cada ingrediente para tacharlo.</p>
      </Seccion>

      <Seccion id="album" titulo="📷 Álbum">
        <Pasos>
          <li>
            Pulsa <strong>«Subir fotos»</strong> y elige una o varias fotos del móvil.
          </li>
          <li>Escribe qué es, el lugar y la fecha (si no sabes el día exacto, pon uno aproximado).</li>
          <li>
            En <strong>«¿Quién sale?»</strong>, toca el nombre de cada persona que aparece.
          </li>
          <li>
            Pulsa <strong>«Subir»</strong> y espera a que termine la barra.
          </li>
        </Pasos>
        <p>
          Las personas etiquetadas tienen la foto en su ficha. Para ver solo las fotos de alguien, usa{" "}
          <strong>«Ver solo las fotos de alguien»</strong>. Si se te olvidó etiquetar a alguien, abre la foto y pulsa{" "}
          <strong>«Editar / etiquetar»</strong>.
        </p>
      </Seccion>

      <Seccion id="datos" titulo="👤 Mis datos">
        <p>
          En <strong>Mis datos</strong> (en el móvil: botón <strong>«Más»</strong> abajo a la derecha) puedes cambiar tu foto, tu
          teléfono, cómo te llamamos y si quieres recibir los avisos por email.
        </p>
      </Seccion>

      <p className="text-center">
        <Link href="/" className="text-crema/50 text-sm underline hover:text-crema">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
