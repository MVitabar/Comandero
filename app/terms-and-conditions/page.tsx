"use client"

import { useI18n } from "@/components/i18n-provider"

export default function TermsAndConditionsPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos y Condiciones de Uso de Comandero</h1>
        <p className="text-sm text-gray-600 mb-8">Fecha de última actualización: 26 de mayo de 2026</p>

        <div className="prose prose-lg max-w-none text-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Introducción</h2>
          <p className="mb-4">
            Bienvenido a Comandero, una plataforma de software como servicio (SaaS) diseñada para la gestión integral de restaurantes, bares y establecimientos de hostelería. Al acceder o utilizar nuestros servicios, usted acepta cumplir y estar legalmente vinculado por los presentes Términos y Condiciones de Uso ("Términos"). Si no está de acuerdo con estos Términos, no debe utilizar nuestros servicios.
          </p>
          <p className="mb-4">
            Estos Términos rigen su acceso y uso de la aplicación web Comandero, incluyendo cualquier contenido, funcionalidad y servicios ofrecidos en o a través de https://comandero.vercel.app/ (el "Servicio"), ya sea como invitado o como usuario registrado.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Definiciones</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>"Comandero" o "Servicio"</strong>: Se refiere a la plataforma de software como servicio, incluyendo la aplicación web, sus funcionalidades y cualquier servicio relacionado ofrecido por nosotros.</li>
            <li><strong>"Usuario" o "Usted"</strong>: Se refiere a la persona o entidad que accede o utiliza el Servicio, incluyendo propietarios de establecimientos, administradores, empleados y cualquier otra persona autorizada.</li>
            <li><strong>"Establecimiento"</strong>: Se refiere al restaurante, bar o cualquier otro negocio de hostelería que utiliza el Servicio Comandero.</li>
            <li><strong>"Contenido del Usuario"</strong>: Se refiere a cualquier dato, información, texto, imagen, video o cualquier otro material que Usted o sus usuarios carguen, publiquen, envíen o transmitan a través del Servicio.</li>
            <li><strong>"Datos Personales"</strong>: Se refiere a cualquier información relacionada con una persona física identificada o identificable, conforme a lo establecido en la Política de Privacidad.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Objeto del Servicio</h2>
          <p className="mb-4">
            Comandero proporciona herramientas para la gestión de operaciones de hostelería, incluyendo, pero no limitado a, gestión de mesas, toma de pedidos, control de inventario, administración de compras, gestión de proveedores, administración de usuarios con roles y permisos, y generación de reportes. El Servicio está diseñado para mejorar la eficiencia operativa y la toma de decisiones en su Establecimiento.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Registro y Cuenta de Usuario</h2>
          <p className="mb-4">Para acceder a ciertas funcionalidades del Servicio, Usted deberá registrar una cuenta. Al registrarse, Usted se compromete a:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Proporcionar información precisa, completa y actualizada durante el proceso de registro.</li>
            <li>Mantener la confidencialidad de su contraseña y credenciales de acceso, siendo el único responsable de todas las actividades que ocurran bajo su cuenta.</li>
            <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta o cualquier otra violación de seguridad.</li>
            <li>Ser mayor de edad legal en su jurisdicción para celebrar contratos vinculantes.</li>
          </ul>
          <p className="mb-4">
            Nos reservamos el derecho de suspender o cancelar su cuenta si la información proporcionada es falsa, inexacta, incompleta o desactualizada.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Uso del Servicio</h2>
          <p className="mb-4">Usted se compromete a utilizar el Servicio de manera lícita y de acuerdo con estos Términos. En particular, Usted no deberá:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Utilizar el Servicio para fines ilegales o no autorizados.</li>
            <li>Interferir o interrumpir la integridad o el rendimiento del Servicio o los datos contenidos en él.</li>
            <li>Intentar obtener acceso no autorizado al Servicio o a sus sistemas o redes relacionados.</li>
            <li>Cargar o transmitir cualquier virus, gusano, defecto, troyano o cualquier elemento de naturaleza destructiva.</li>
            <li>Realizar ingeniería inversa, descompilar o desensamblar cualquier parte del Servicio.</li>
            <li>Utilizar el Servicio para enviar spam o mensajes no solicitados.</li>
            <li>Infringir los derechos de propiedad intelectual de terceros.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Propiedad Intelectual</h2>
          <p className="mb-4">
            Todos los derechos de propiedad intelectual sobre Comandero y su contenido (excluyendo el Contenido del Usuario), incluyendo, pero no limitado a, software, diseño, texto, gráficos, logotipos, iconos, imágenes, clips de audio, descargas digitales, compilaciones de datos y el software, son propiedad exclusiva de Comandero o de sus licenciantes y están protegidos por las leyes de derechos de autor, marcas registradas y otras leyes de propiedad intelectual.
          </p>
          <p className="mb-4">
            Usted no adquiere ningún derecho de propiedad sobre el Servicio o cualquier contenido al utilizarlo. Se le otorga una licencia limitada, no exclusiva, no transferible y revocable para acceder y utilizar el Servicio únicamente para los fines previstos en estos Términos.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Precios y Pagos</h2>
          <p className="mb-4">
            El acceso a ciertas funcionalidades del Servicio puede requerir el pago de tarifas de suscripción. Los detalles de los planes de precios, las tarifas aplicables y los métodos de pago se especificarán en la sección de precios de nuestro sitio web o dentro de la aplicación.
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Facturación:</strong> Usted autoriza a Comandero a cargar las tarifas de suscripción aplicables a su método de pago seleccionado.</li>
            <li><strong>Renovación:</strong> Las suscripciones se renovarán automáticamente al final de cada período de facturación, a menos que Usted las cancele antes de la fecha de renovación.</li>
            <li><strong>Cambios de Precios:</strong> Nos reservamos el derecho de modificar los precios de nuestros servicios en cualquier momento, previa notificación con al menos 30 días de antelación.</li>
            <li><strong>Reembolsos:</strong> Las tarifas de suscripción no son reembolsables, salvo que se indique lo contrario en nuestra política de reembolsos específica.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Confidencialidad y Protección de Datos</h2>
          <p className="mb-4">
            La privacidad de sus Datos Personales y los de sus clientes es de suma importancia para nosotros. La recopilación, uso, almacenamiento y protección de sus Datos Personales se rige por nuestra <strong>Política de Privacidad</strong>, la cual forma parte integral de estos Términos. Al aceptar estos Términos, Usted también acepta nuestra Política de Privacidad.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Limitación de Responsabilidad</h2>
          <p className="mb-4">
            El Servicio se proporciona "tal cual" y "según disponibilidad", sin garantías de ningún tipo, ya sean expresas o implícitas. Comandero no garantiza que el Servicio será ininterrumpido, libre de errores, seguro o que cualquier defecto será corregido.
          </p>
          <p className="mb-4">
            En la máxima medida permitida por la ley aplicable, Comandero, sus afiliados, directores, empleados, agentes, proveedores o licenciantes no serán responsables por ningún daño indirecto, incidental, especial, consecuencial o punitivo, incluyendo, sin limitación, pérdida de beneficios, datos, uso, fondo de comercio u otras pérdidas intangibles, resultantes de (i) su acceso o uso o incapacidad de acceder o usar el Servicio; (ii) cualquier conducta o contenido de terceros en el Servicio; (iii) cualquier contenido obtenido del Servicio; y (iv) acceso no autorizado, uso o alteración de sus transmisiones o contenido, ya sea basado en garantía, contrato, agravio (incluyendo negligencia) o cualquier otra teoría legal, hayamos sido o no informados de la posibilidad de tales daños.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Modificaciones de los Términos</h2>
          <p className="mb-4">
            Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, haremos esfuerzos razonables para proporcionar un aviso de al menos 30 días antes de que los nuevos términos entren en vigor. Lo que constituye un cambio material se determinará a nuestra sola discreción. Al continuar accediendo o utilizando nuestro Servicio después de que esas revisiones entren en vigor, Usted acepta estar vinculado por los términos revisados.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Terminación del Servicio</h2>
          <p className="mb-4">
            Podemos terminar o suspender su acceso a nuestro Servicio inmediatamente, sin previo aviso ni responsabilidad, por cualquier motivo, incluyendo, sin limitación, si Usted incumple estos Términos. Tras la terminación, su derecho a usar el Servicio cesará inmediatamente.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. Ley Aplicable y Jurisdicción</h2>
          <p className="mb-4">
            Estos Términos se regirán e interpretarán de acuerdo con las leyes del país donde Comandero tiene su sede principal de operaciones, sin tener en cuenta sus disposiciones sobre conflicto de leyes. Usted acepta someterse a la jurisdicción exclusiva de los tribunales ubicados en dicho país para la resolución de cualquier disputa que surja de o esté relacionada con estos Términos o el Servicio.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">13. Disposiciones Generales</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Acuerdo Completo:</strong> Estos Términos, junto con la Política de Privacidad, constituyen el acuerdo completo entre Usted y Comandero con respecto al uso del Servicio.</li>
            <li><strong>Divisibilidad:</strong> Si alguna disposición de estos Términos se considera inválida o inaplicable, las disposiciones restantes de estos Términos permanecerán en pleno vigor y efecto.</li>
            <li><strong>Contacto:</strong> Si tiene alguna pregunta sobre estos Términos, por favor contáctenos a través de [correo electrónico de soporte] o [formulario de contacto].</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
