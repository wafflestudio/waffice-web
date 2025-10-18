'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FolderOpen, Receipt, Calculator, TrendingUp } from 'lucide-react';

// Mock data for dashboard
const stats = {
  totalMembers: 12,
  activeProjects: 3,
  pendingClaims: 5,
  accountBalance: 550,
  recentActivity: [
    { type: 'member', description: '새 회원 가입: 김철수', time: '2시간 전' },
    { type: 'project', description: '프로젝트 "웹앱" 상태가 활성으로 변경됨', time: '4시간 전' },
    { type: 'expense', description: '지출 청구서 제출: 재료비 150,000원', time: '1일 전' },
    { type: 'transaction', description: '새 수입: 후원금 200,000원', time: '2일 전' },
  ]
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">
          와플 스튜디오 관리 시스템에 오신 것을 환영합니다
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 회원 수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              지난 달 대비 +2명
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행 중인 프로젝트</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              이번 달 완료: 1개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기 중인 청구서</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingClaims}</div>
            <p className="text-xs text-muted-foreground">
              검토 필요
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">계좌 잔액</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accountBalance.toLocaleString()}원</div>
            <p className="text-xs text-muted-foreground">
              지난 달 대비 +200,000원
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type === 'member' ? '회원' : 
                     activity.type === 'project' ? '프로젝트' :
                     activity.type === 'expense' ? '지출' : '거래'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">새 회원 추가</span>
                </div>
              </div>
              <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-4 w-4" />
                  <span className="text-sm font-medium">프로젝트 생성</span>
                </div>
              </div>
              <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Receipt className="h-4 w-4" />
                  <span className="text-sm font-medium">지출 청구서 제출</span>
                </div>
              </div>
              <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-4 w-4" />
                  <span className="text-sm font-medium">회계 보기</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}