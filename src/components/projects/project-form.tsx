'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Project, ProjectCreate, ProjectUpdate, Member } from '@/types';
import { apiClient } from '@/lib/api';

const projectSchema = z.object({
  name: z.string().min(1, '프로젝트 이름은 필수입니다'),
  description: z.string().optional(),
  budget: z.number().positive('예산은 양수여야 합니다').optional(),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']).optional(),
  member_ids: z.array(z.number()).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: ProjectCreate | ProjectUpdate) => Promise<void>;
  trigger?: React.ReactNode;
}

export function ProjectForm({ project, onSubmit, trigger }: ProjectFormProps) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const isEdit = !!project;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          name: project.name,
          description: project.description || '',
          budget: project.budget || undefined,
          status: project.status,
          member_ids: project.members.map(m => m.id),
        }
      : {
          name: '',
          description: '',
          budget: undefined,
          status: 'planning',
          member_ids: [],
        },
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersData = await apiClient.getMembers();
        setMembers(membersData);
        if (project) {
          setSelectedMemberIds(project.members.map(m => m.id));
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };
    fetchMembers();
  }, [project]);

  const handleFormSubmit = async (data: ProjectFormData) => {
    try {
      const submitData = {
        ...data,
        member_ids: selectedMemberIds,
      };
      await onSubmit(submitData);
      setOpen(false);
      reset();
      setSelectedMemberIds([]);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const toggleMember = (memberId: number) => {
    setSelectedMemberIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const formContent = (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">프로젝트 이름</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="프로젝트 이름을 입력하세요"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">설명</Label>
        <Input
          id="description"
          {...register('description')}
          placeholder="프로젝트 설명을 입력하세요"
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="budget">예산 (선택사항)</Label>
        <Input
          id="budget"
          type="number"
          step="0.01"
          {...register('budget', { valueAsNumber: true })}
          placeholder="예산 금액을 입력하세요"
        />
        {errors.budget && (
          <p className="text-sm text-destructive">{errors.budget.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="status">상태</Label>
        <select
          id="status"
          {...register('status')}
          className="w-full p-2 border rounded-md"
        >
          <option value="planning">기획</option>
          <option value="active">진행중</option>
          <option value="completed">완료</option>
          <option value="cancelled">취소</option>
        </select>
        {errors.status && (
          <p className="text-sm text-destructive">{errors.status.message}</p>
        )}
      </div>

      <div>
        <Label>멤버 할당</Label>
        <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
          {members.map((member) => (
            <label key={member.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedMemberIds.includes(member.id)}
                onChange={() => toggleMember(member.id)}
                className="rounded"
              />
              <span className="text-sm">{member.name} ({member.email})</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(false)}
        >
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : isEdit ? '수정' : '생성'}
        </Button>
      </div>
    </form>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? '프로젝트 수정' : '새 프로젝트 추가'}
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
