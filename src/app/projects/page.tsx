'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectForm } from '@/components/projects/project-form';
import { ProjectTable } from '@/components/projects/project-table';
import { apiClient } from '@/lib/api';
import { Project, ProjectCreate, ProjectUpdate } from '@/types';
import { Plus } from 'lucide-react';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects(),
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: ProjectCreate) => apiClient.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowAddForm(false);
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProjectUpdate }) =>
      apiClient.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleCreateProject = async (data: ProjectCreate) => {
    await createProjectMutation.mutateAsync(data);
  };

  const handleUpdateProject = async (id: number, data: ProjectUpdate) => {
    await updateProjectMutation.mutateAsync({ id, data });
  };

  const handleDeleteProject = async (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProjectMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">프로젝트 목록을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-destructive">
          프로젝트 목록을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">프로젝트 관리</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          프로젝트 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>스튜디오 프로젝트 ({projects.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectTable
            projects={projects}
            onUpdate={handleUpdateProject}
            onDelete={handleDeleteProject}
          />
        </CardContent>
      </Card>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">새 프로젝트 추가</h2>
            <ProjectForm
              onSubmit={handleCreateProject}
            />
            <Button
              variant="outline"
              onClick={() => setShowAddForm(false)}
              className="mt-4 w-full"
            >
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
