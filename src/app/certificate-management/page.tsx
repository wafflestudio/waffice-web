import { MOCK_CERTIFICATE_HISTORY } from "@/components/certificates/certificate-history.mock"
import { CertificateHistoryView } from "@/components/certificates/certificate-history-view"

export default function CertificateManagementPage() {
	// TODO(API): 발급 이력 조회 hook이 생기면 mock 대신 query 결과를 전달한다.
	return <CertificateHistoryView rows={MOCK_CERTIFICATE_HISTORY} />
}
