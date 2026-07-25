import { MOCK_ACTIVITY_HISTORY } from "@/components/activities/activity-history.mock"
import { ActivityHistoryView } from "@/components/activities/activity-history-view"

export default function ActivitiesPage() {
	// TODO(API): 활동 요청 상태와 요청 이력이 포함된 조회 API가 준비되면 mock을 query 결과로 교체한다.
	return <ActivityHistoryView initialRecords={MOCK_ACTIVITY_HISTORY} />
}
