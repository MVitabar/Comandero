import { useI18n } from "@/components/i18n-provider"

export default function PrivacyPolicyPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidad de Comandero</h1>
        <p className="text-sm text-gray-600 mb-8">Fecha de última actualización: 26 de mayo de 2026</p>

        <div className="prose prose-lg max-w-none text-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Introducción</h2>
          <p className="mb-4">
            En Comandero, valoramos y respetamos su privacidad. Esta Política de Privacidad describe cómo recopilamos, utilizamos, procesamos y divulgamos su información, incluyendo datos personales, en relación con su acceso y uso de la plataforma Comandero (el "Servicio"). Al utilizar nuestro Servicio, usted acepta las prácticas descritas en esta Política de Privacidad.
          </p>
          <p className="mb-4">
            Esta Política de Privacidad se aplica a todos los usuarios del Servicio, incluyendo propietarios de establecimientos, administradores, empleados y cualquier otra persona que acceda o utilice Comandero. Es importante que lea esta Política de Privacidad junto con nuestros Términos y Condiciones de Uso.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Información que Recopilamos</h2>
          <p className="mb-4">Recopilamos diferentes tipos de información para proporcionar y mejorar nuestro Servicio:</p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2.1. Información que Usted nos Proporciona Directamente</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Información de la Cuenta:</strong> Cuando se registra en Comandero, recopilamos información como su nombre, dirección de correo electrónico, número de teléfono, nombre del establecimiento, dirección del establecimiento e información de facturación.</li>
            <li><strong>Información del Perfil:</strong> Si decide completar su perfil, podemos recopilar información adicional como su rol en el establecimiento.</li>
            <li><strong>Contenido del Usuario:</strong> Recopilamos la información que usted ingresa en el Servicio, incluyendo datos de mesas, pedidos, productos, inventario, compras, proveedores, información de empleados (nombres, roles) y cualquier otra información que cargue o cree.</li>
            <li><strong>Comunicaciones:</strong> Cuando se comunica con nosotros (por ejemplo, a través de soporte al cliente, correo electrónico o formularios de contacto), recopilamos el contenido de sus comunicaciones y cualquier información que elija proporcionar.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2.2. Información que Recopilamos Automáticamente</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Datos de Uso:</strong> Recopilamos información sobre cómo accede y utiliza el Servicio, incluyendo su dirección IP, tipo de navegador, sistema operativo, páginas visitadas, tiempo dedicado a esas páginas, fechas y horas de acceso, y otros datos de diagnóstico.</li>
            <li><strong>Datos de Dispositivo:</strong> Recopilamos información sobre el dispositivo que utiliza para acceder al Servicio, como el modelo de hardware, el sistema operativo y la versión, identificadores únicos de dispositivo e información de la red móvil.</li>
            <li><strong>Cookies y Tecnologías Similares:</strong> Utilizamos cookies y tecnologías de seguimiento similares para rastrear la actividad en nuestro Servicio y mantener cierta información. Las cookies son archivos con una pequeña cantidad de datos que pueden incluir un identificador único anónimo. Puede indicar a su navegador que rechace todas las cookies o que le avise cuando se envía una cookie. Sin embargo, si no acepta las cookies, es posible que no pueda utilizar algunas partes de nuestro Servicio.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Cómo Utilizamos su Información</h2>
          <p className="mb-4">Utilizamos la información recopilada para diversos fines, incluyendo:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Proveer y Mantener el Servicio:</strong> Para operar, mantener y mejorar las funcionalidades de Comandero.</li>
            <li><strong>Gestionar su Cuenta:</strong> Para registrarlo como usuario, administrar su cuenta y proporcionarle acceso a las funcionalidades del Servicio.</li>
            <li><strong>Personalizar su Experiencia:</strong> Para adaptar el Servicio a sus preferencias y necesidades, por ejemplo, mostrando información relevante para su establecimiento.</li>
            <li><strong>Comunicarnos con Usted:</strong> Para enviarle notificaciones importantes sobre el Servicio, actualizaciones, alertas de seguridad y mensajes de soporte.</li>
            <li><strong>Procesar Pagos:</strong> Para gestionar las transacciones de suscripción y facturación.</li>
            <li><strong>Mejorar el Servicio:</strong> Para analizar el uso del Servicio, identificar tendencias, realizar investigaciones y desarrollar nuevas características y funcionalidades.</li>
            <li><strong>Seguridad:</strong> Para detectar, prevenir y abordar fraudes, actividades no autorizadas o ilegales, y proteger la seguridad de nuestros usuarios y del Servicio.</li>
            <li><strong>Cumplimiento Legal:</strong> Para cumplir con nuestras obligaciones legales y regulatorias.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Cómo Compartimos su Información</h2>
          <p className="mb-4">No vendemos ni alquilamos su información personal a terceros. Podemos compartir su información en las siguientes circunstancias:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Con Proveedores de Servicios:</strong> Podemos emplear a empresas e individuos de terceros para facilitar nuestro Servicio (por ejemplo, proveedores de alojamiento, procesadores de pagos, servicios de análisis de datos). Estos terceros tienen acceso a su información solo para realizar estas tareas en nuestro nombre y están obligados a no divulgarla ni utilizarla para ningún otro propósito.</li>
            <li><strong>Transferencias Comerciales:</strong> Si Comandero participa en una fusión, adquisición o venta de activos, su información personal puede ser transferida. Le notificaremos antes de que su información personal sea transferida y quede sujeta a una Política de Privacidad diferente.</li>
            <li><strong>Cumplimiento Legal:</strong> Podemos divulgar su información personal cuando sea requerido por ley o en respuesta a solicitudes válidas de autoridades públicas (por ejemplo, un tribunal o una agencia gubernamental).</li>
            <li><strong>Con su Consentimiento:</strong> Podemos compartir su información con terceros cuando tengamos su consentimiento explícito para hacerlo.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Transferencia Internacional de Datos</h2>
          <p className="mb-4">
            Su información, incluyendo Datos Personales, puede ser transferida y mantenida en computadoras ubicadas fuera de su estado, provincia, país u otra jurisdicción gubernamental donde las leyes de protección de datos pueden diferir de las de su jurisdicción. Si usted se encuentra fuera de [País de Operación Principal de Comandero] y elige proporcionarnos información, tenga en cuenta que transferimos los datos, incluidos los Datos Personales, a [País de Operación Principal de Comandero] y los procesamos allí. Su consentimiento a esta Política de Privacidad seguido de su envío de dicha información representa su acuerdo con esa transferencia.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Seguridad de los Datos</h2>
          <p className="mb-4">
            La seguridad de sus datos es importante para nosotros, pero recuerde que ningún método de transmisión por Internet o método de almacenamiento electrónico es 100% seguro. Si bien nos esforzamos por utilizar medios comercialmente aceptables para proteger su información personal, no podemos garantizar su seguridad absoluta.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Sus Derechos de Protección de Datos</h2>
          <p className="mb-4">
            Dependiendo de su ubicación y las leyes de protección de datos aplicables (como el GDPR en Europa o la LGPD en Brasil), usted puede tener los siguientes derechos con respecto a sus Datos Personales:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Derecho de Acceso:</strong> El derecho a solicitar copias de sus Datos Personales.</li>
            <li><strong>Derecho de Rectificación:</strong> El derecho a solicitar que corrijamos cualquier información que considere inexacta o que complete la información que considere incompleta.</li>
            <li><strong>Derecho de Supresión (Derecho al Olvido):</strong> El derecho a solicitar que borremos sus Datos Personales bajo ciertas condiciones.</li>
            <li><strong>Derecho a Restringir el Procesamiento:</strong> El derecho a solicitar que restrinjamos el procesamiento de sus Datos Personales bajo ciertas condiciones.</li>
            <li><strong>Derecho a Oponerse al Procesamiento:</strong> El derecho a oponerse a nuestro procesamiento de sus Datos Personales bajo ciertas condiciones.</li>
            <li><strong>Derecho a la Portabilidad de Datos:</strong> El derecho a solicitar que transfiramos los datos que hemos recopilado a otra organización, o directamente a usted, bajo ciertas condiciones.</li>
          </ul>
          <p className="mb-4">Para ejercer cualquiera de estos derechos, por favor contáctenos utilizando la información proporcionada en la sección de Contacto.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Enlaces a Otros Sitios Web</h2>
          <p className="mb-4">
            Nuestro Servicio puede contener enlaces a otros sitios web que no son operados por nosotros. Si hace clic en un enlace de un tercero, será dirigido al sitio de ese tercero. Le recomendamos encarecidamente que revise la Política de Privacidad de cada sitio que visite. No tenemos control ni asumimos ninguna responsabilidad por el contenido, las políticas de privacidad o las prácticas de los sitios o servicios de terceros.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Privacidad de los Niños</h2>
          <p className="mb-4">
            Nuestro Servicio no se dirige a ninguna persona menor de 18 años ("Niños"). No recopilamos a sabiendas información de identificación personal de ninguna persona menor de 18 años. Si usted es padre o tutor y sabe que su Hijo nos ha proporcionado Datos Personales, contáctenos. Si nos damos cuenta de que hemos recopilado Datos Personales de Niños sin verificación del consentimiento de los padres, tomamos medidas para eliminar esa información de nuestros servidores.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Cambios a esta Política de Privacidad</h2>
          <p className="mb-4">
            Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página. Le recomendamos revisar esta Política de Privacidad periódicamente para cualquier cambio. Los cambios a esta Política de Privacidad son efectivos cuando se publican en esta página.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Contacto</h2>
          <p className="mb-4">
            Si tiene alguna pregunta sobre esta Política de Privacidad, por favor contáctenos a través de [correo electrónico de soporte] o [formulario de contacto].
          </p>
        </div>
      </div>
    </div>
  )
}
