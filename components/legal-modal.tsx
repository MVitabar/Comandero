"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n-provider"

interface LegalModalProps {
  type: "terms" | "privacy"
  trigger: React.ReactNode
}

export function LegalModal({ type, trigger }: LegalModalProps) {
  const { t } = useI18n()

  const content = type === "terms" ? (
    <div className="prose prose-sm max-w-none text-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">1. Introducción</h2>
      <p className="mb-2">
        Bienvenido a Comandero, una plataforma de software como servicio (SaaS) diseñada para la gestión integral de restaurantes, bares y establecimientos de hostelería. Al acceder o utilizar nuestros servicios, usted acepta cumplir y estar legalmente vinculado por los presentes Términos y Condiciones de Uso ("Términos"). Si no está de acuerdo con estos Términos, no debe utilizar nuestros servicios.
      </p>
      <p className="mb-2">
        Estos Términos rigen su acceso y uso de la aplicación web Comandero, incluyendo cualquier contenido, funcionalidad y servicios ofrecidos en o a través de https://comandero.vercel.app/ (el "Servicio"), ya sea como invitado o como usuario registrado.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">2. Definiciones</h2>
      <ul className="list-disc pl-4 mb-2 space-y-1 text-sm">
        <li><strong>"Comandero" o "Servicio"</strong>: Se refiere a la plataforma de software como servicio, incluyendo la aplicación web, sus funcionalidades y cualquier servicio relacionado ofrecido por nosotros.</li>
        <li><strong>"Usuario" o "Usted"</strong>: Se refiere a la persona o entidad que accede o utiliza el Servicio, incluyendo propietarios de establecimientos, administradores, empleados y cualquier otra persona autorizada.</li>
        <li><strong>"Establecimiento"</strong>: Se refiere al restaurante, bar o cualquier otro negocio de hostelería que utiliza el Servicio Comandero.</li>
        <li><strong>"Contenido del Usuario"</strong>: Se refiere a cualquier dato, información, texto, imagen, video o cualquier otro material que Usted o sus usuarios carguen, publiquen, envíen o transmitan a través del Servicio.</li>
        <li><strong>"Datos Personales"</strong>: Se refiere a cualquier información relacionada con una persona física identificada o identificable, conforme a lo establecido en la Política de Privacidad.</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">3. Objeto del Servicio</h2>
      <p className="mb-2">
        Comandero proporciona herramientas para la gestión de operaciones de hostelería, incluyendo, pero no limitado a, gestión de mesas, toma de pedidos, control de inventario, administración de compras, gestión de proveedores, administración de usuarios con roles y permisos, y generación de reportes. El Servicio está diseñado para mejorar la eficiencia operativa y la toma de decisiones en su Establecimiento.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">4. Registro y Cuenta de Usuario</h2>
      <p className="mb-2">Para acceder a ciertas funcionalidades del Servicio, Usted deberá registrar una cuenta. Al registrarse, Usted se compromete a:</p>
      <ul className="list-disc pl-4 mb-2 space-y-1 text-sm">
        <li>Proporcionar información precisa, completa y actualizada durante el proceso de registro.</li>
        <li>Mantener la confidencialidad de su contraseña y credenciales de acceso.</li>
        <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta.</li>
        <li>Ser mayor de edad legal en su jurisdicción.</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">5. Uso del Servicio</h2>
      <p className="mb-2">Usted se compromete a utilizar el Servicio de manera lícita. En particular, Usted no deberá:</p>
      <ul className="list-disc pl-4 mb-2 space-y-1 text-sm">
        <li>Utilizar el Servicio para fines ilegales.</li>
        <li>Interferir o interrumpir la integridad del Servicio.</li>
        <li>Intentar obtener acceso no autorizado.</li>
        <li>Cargar virus o elementos destructivos.</li>
        <li>Realizar ingeniería inversa.</li>
        <li>Enviar spam.</li>
        <li>Infringir derechos de propiedad intelectual.</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">6. Propiedad Intelectual</h2>
      <p className="mb-2">
        Todos los derechos de propiedad intelectual sobre Comandero y su contenido son propiedad exclusiva de Comandero o de sus licenciantes. Usted no adquiere ningún derecho de propiedad sobre el Servicio. Se le otorga una licencia limitada, no exclusiva, no transferible y revocable para acceder y utilizar el Servicio.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">7. Precios y Pagos</h2>
      <ul className="list-disc pl-4 mb-2 space-y-1 text-sm">
        <li><strong>Facturación:</strong> Usted autoriza a Comandero a cargar las tarifas aplicables.</li>
        <li><strong>Renovación:</strong> Las suscripciones se renovarán automáticamente.</li>
        <li><strong>Cambios de Precios:</strong> Nos reservamos el derecho de modificar los precios con aviso de 30 días.</li>
        <li><strong>Reembolsos:</strong> Las tarifas no son reembolsables.</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">8. Confidencialidad y Protección de Datos</h2>
      <p className="mb-2">
        La privacidad de sus Datos Personales es de suma importancia. La recopilación, uso, almacenamiento y protección se rige por nuestra Política de Privacidad.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">9. Limitación de Responsabilidad</h2>
      <p className="mb-2">
        El Servicio se proporciona "tal cual" sin garantías. Comandero no será responsable por daños indirectos, incidentales, especiales, consecuenciales o punitivos.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">10. Modificaciones de los Términos</h2>
      <p className="mb-2">
        Nos reservamos el derecho de modificar estos Términos en cualquier momento. Si una revisión es material, haremos esfuerzos razonables para proporcionar un aviso de al menos 30 días.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">11. Terminación del Servicio</h2>
      <p className="mb-2">
        Podemos terminar o suspender su acceso a nuestro Servicio inmediatamente, sin previo aviso ni responsabilidad, por cualquier motivo, incluyendo si Usted incumple estos Términos.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">12. Ley Aplicable y Jurisdicción</h2>
      <p className="mb-2">
        Estos Términos se regirán por las leyes del país donde Comandero tiene su sede principal. Usted acepta someterse a la jurisdicción exclusiva de los tribunales ubicados en dicho país.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">13. Disposiciones Generales</h2>
      <ul className="list-disc pl-4 mb-2 space-y-1 text-sm">
        <li><strong>Acuerdo Completo:</strong> Estos Términos, junto con la Política de Privacidad, constituyen el acuerdo completo.</li>
        <li><strong>Divisibilidad:</strong> Si alguna disposición se considera inválida, las disposiciones restantes permanecerán en pleno vigor.</li>
        <li><strong>Contacto:</strong> Si tiene preguntas, contáctenos a través de [correo electrónico de soporte] o [formulario de contacto].</li>
      </ul>
    </div>
  ) : (
    <div className="prose prose-sm max-w-none text-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">1. Introducción</h2>
      <p className="mb-2">
        En Comandero, valoramos y respetamos su privacidad. Esta Política de Privacidad describe cómo recopilamos, utilizamos, procesamos y divulgamos su información, incluyendo datos personales, en relación con su acceso y uso de la plataforma Comandero (el "Servicio"). Al utilizar nuestro Servicio, usted acepta las prácticas descritas en esta Política de Privacidad.
      </p>
      <p className="mb-2">
        Esta Política de Privacidad se aplica a todos los usuarios del Servicio, incluyendo propietarios de establecimientos, administradores, empleados y cualquier otra persona que acceda o utilice Comandero.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">2. Información que Recopilamos</h2>
      <p className="mb-2">Recopilamos diferentes tipos de información:</p>
      <ul className="list-disc pl-4 mb-2 space-y-1 text-sm">
        <li><strong>Información de la Cuenta:</strong> Nombre, email, teléfono, nombre del establecimiento, dirección.</li>
        <li><strong>Información del Perfil:</strong> Rol en el establecimiento.</li>
        <li><strong>Contenido del Usuario:</strong> Datos de mesas, pedidos, productos, inventario, etc.</li>
        <li><strong>Comunicaciones:</strong> Contenido de comunicaciones con soporte.</li>
        <li><strong>Datos de Uso:</strong> Dirección IP, navegador, sistema operativo, páginas visitadas.</li>
        <li><strong>Datos de Dispositivo:</strong> Modelo de hardware, sistema operativo, identificadores.</li>
        <li><strong>Cookies:</strong> Cookies y tecnologías similares para rastrear actividad.</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">3. Cómo Utilizamos su Información</h2>
      <ul className="list-disc pl-4 mb-2 space-y-1 text-sm">
        <li>Proveer y Mantener el Servicio</li>
        <li>Gestionar su Cuenta</li>
        <li>Personalizar su Experiencia</li>
        <li>Comunicarnos con Usted</li>
        <li>Procesar Pagos</li>
        <li>Mejorar el Servicio</li>
        <li>Seguridad</li>
        <li>Cumplimiento Legal</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">4. Cómo Compartimos su Información</h2>
      <p className="mb-2">No vendemos ni alquilamos su información personal. Podemos compartir su información con:</p>
      <ul className="list-disc pl-4 mb-2 space-y-1 text-sm">
        <li>Proveedores de Servicios</li>
        <li>Transferencias Comerciales</li>
        <li>Cumplimiento Legal</li>
        <li>Con su Consentimiento</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">5. Transferencia Internacional de Datos</h2>
      <p className="mb-2">
        Su información puede ser transferida y mantenida en computadoras ubicadas fuera de su jurisdicción donde las leyes de protección de datos pueden diferir.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">6. Seguridad de los Datos</h2>
      <p className="mb-2">
        La seguridad de sus datos es importante, pero ningún método de transmisión por Internet es 100% seguro.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">7. Sus Derechos de Protección de Datos</h2>
      <p className="mb-2">Usted puede tener los siguientes derechos:</p>
      <ul className="list-disc pl-4 mb-2 space-y-1 text-sm">
        <li>Derecho de Acceso</li>
        <li>Derecho de Rectificación</li>
        <li>Derecho de Supresión</li>
        <li>Derecho a Restringir el Procesamiento</li>
        <li>Derecho a Oponerse al Procesamiento</li>
        <li>Derecho a la Portabilidad de Datos</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">8. Enlaces a Otros Sitios Web</h2>
      <p className="mb-2">
        Nuestro Servicio puede contener enlaces a otros sitios web. Le recomendamos revisar la Política de Privacidad de cada sitio que visite.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">9. Privacidad de los Niños</h2>
      <p className="mb-2">
        Nuestro Servicio no se dirige a personas menores de 18 años. No recopilamos información de menores de 18 años.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">10. Cambios a esta Política de Privacidad</h2>
      <p className="mb-2">
        Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio publicando la nueva Política en esta página.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">11. Contacto</h2>
      <p className="mb-2">
        Si tiene alguna pregunta sobre esta Política de Privacidad, por favor contáctenos a través de [correo electrónico de soporte] o [formulario de contacto].
      </p>
    </div>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {type === "terms" ? t("termsAndConditions") : t("privacyPolicy")}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {content}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
