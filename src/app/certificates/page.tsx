import { MOCK_MY_CERTIFICATE_APPLICATIONS } from "@/components/certificates/certificate-application.mock"
import { CertificateApplicationView } from "@/components/certificates/certificate-application-view"

export default function CertificatesPage() {
	return <CertificateApplicationView initialRows={MOCK_MY_CERTIFICATE_APPLICATIONS} />
}
