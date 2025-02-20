import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | PickEat</title>
        <meta
          name="description"
          content="Leggi la Privacy Policy di PickEat per capire come gestiamo i tuoi dati personali."
        />
      </Head>
      <div className="p-8 max-w-4xl mx-auto bg-white shadow-lg rounded-lg mt-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Privacy Policy di PickEat</h1>
        <p className="text-gray-600 text-lg leading-relaxed text-center">
          Questa Applicazione raccoglie alcuni Dati Personali dei propri Utenti.
        </p>
        <p className="text-sm italic mt-4 text-center text-gray-500">
          Questo documento può essere stampato utilizzando il comando di stampa presente nelle impostazioni di qualsiasi browser.
        </p>

        <h2 className="text-2xl font-semibold mt-6 text-gray-800 border-b pb-2">Dati Personali trattati</h2>
        <p className="text-gray-700 mt-2">
          Fra i Dati Personali raccolti da questa Applicazione ci sono: nome, cognome, email.
        </p>

        <h2 className="text-2xl font-semibold mt-6 text-gray-800 border-b pb-2">Informazioni di contatto</h2>
        <p className="mt-2 text-gray-700"><strong>Titolare del Trattamento dei Dati:</strong> PickEat s.r.l</p>
        <p className="text-gray-700">Largo Paganini, 1/20 - 17037 Albenga (SV) Italia</p>
        <p className="text-gray-700">Email: <a href="mailto:info@pickeat.it" className="text-blue-600 underline">info@pickeat.it</a></p>

        <h2 className="text-2xl font-semibold mt-6 text-gray-800 border-b pb-2">Modalità e luogo del trattamento</h2>
        <p className="text-gray-700 mt-2">
          Il trattamento avviene con strumenti informatici e telematici, adottando misure di sicurezza adeguate.
          I Dati possono essere trattati presso le sedi operative del Titolare o in altri luoghi.
        </p>

        <h2 className="text-2xl font-semibold mt-6 text-gray-800 border-b pb-2">Periodo di conservazione</h2>
        <p className="text-gray-700 mt-2">
          I Dati sono conservati per il tempo necessario alle finalità per cui sono stati raccolti e possono essere mantenuti più a lungo per obblighi legali o su consenso dell’Utente.
        </p>

        <h2 className="text-2xl font-semibold mt-6 text-gray-800 border-b pb-2">Diritti dell’Utente (GDPR)</h2>
        <ul className="list-disc ml-6 mt-2 text-gray-700">
          <li className="mb-1">Revocare il consenso in qualsiasi momento.</li>
          <li className="mb-1">Opporsi al trattamento dei propri Dati.</li>
          <li className="mb-1">Accedere ai propri Dati e riceverne una copia.</li>
          <li className="mb-1">Chiedere la rettifica o la cancellazione dei propri Dati.</li>
          <li className="mb-1">Richiedere la limitazione del trattamento.</li>
          <li className="mb-1">Proporre reclamo all'autorità di controllo competente.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 text-gray-800 border-b pb-2">Modifiche alla Privacy Policy</h2>
        <p className="text-gray-700 mt-2">
          Il Titolare del Trattamento si riserva il diritto di apportare modifiche alla presente policy. Gli Utenti sono invitati a consultare periodicamente questa pagina per eventuali aggiornamenti.
        </p>

        <p className="text-sm text-gray-500 mt-6 text-center">Ultimo aggiornamento: [inserire data]</p>
      </div>
    </>
  );
}