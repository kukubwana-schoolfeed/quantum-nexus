/**
 * JoinPage — Public landing page for QR code customer capture.
 * Customer scans QR, enters name and phone, joins customer database.
 * Module: offline-qr-bridge
 * Phase: 3
 */

/**
 * Join page component for walk-in customer capture via QR code.
 * @param {Object} props - Component props
 * @param {Object} props.params - Route parameters
 * @param {string} props.business_slug - Business slug from QR code URL
 * @returns {JSX.Element} Customer capture form page
 */
export default async function JoinPage({
  params,
}: {
  params: Promise<{ business_slug: string }>;
}): Promise<JSX.Element> {
  const { business_slug } = await params;
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center">Welcome</h1>
        <p className="text-sm text-gray-400 text-center mt-2">
          Join {business_slug}&apos;s loyalty programme
        </p>
        <div className="mt-8 space-y-4">
          <p className="text-gray-500 text-sm text-center">PLACEHOLDER: Phase 2 mock form</p>
        </div>
      </div>
    </div>
  );
}



