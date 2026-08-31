"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-01-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────────────────
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('email', sa.String(), unique=True, index=True, nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now(),
                  nullable=True),
    )

    # ── user_profiles ──────────────────────────────────────────────────────
    op.create_table(
        'user_profiles',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(),
                  sa.ForeignKey('users.id'), unique=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('target_role', sa.String(), nullable=True),
        sa.Column('experience_level', sa.String(), nullable=True),
        sa.Column('skills', sa.Text(), nullable=True),
    )

    # ── resumes ────────────────────────────────────────────────────────────
    op.create_table(
        'resumes',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('file_name', sa.String(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
    )

    # ── interviews ─────────────────────────────────────────────────────────
    op.create_table(
        'interviews',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('resume_id', sa.Integer(),
                  sa.ForeignKey('resumes.id'), nullable=True),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('job_description', sa.Text(), nullable=True),
        sa.Column('role', sa.String(), nullable=True),
        sa.Column('experience_level', sa.String(), nullable=True),
        sa.Column('difficulty', sa.String(), nullable=True),
        sa.Column('interview_type', sa.String(), nullable=True),
        sa.Column('company', sa.String(), nullable=True),
        sa.Column('question_count', sa.Integer(), default=5),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('overall_score', sa.Float(), nullable=True),
        sa.Column('result_label', sa.String(), nullable=True),
        sa.Column('status', sa.String(), default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now(),
                  nullable=True),
    )

    # ── questions ──────────────────────────────────────────────────────────
    op.create_table(
        'questions',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('interview_id', sa.Integer(),
                  sa.ForeignKey('interviews.id')),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('type', sa.String(), nullable=True),
        sa.Column('question_number', sa.Integer(), nullable=True),
        sa.Column('question_category', sa.String(), nullable=True),
        sa.Column('is_follow_up', sa.Boolean(), default=False),
        sa.Column('order', sa.Integer(), nullable=True),
    )

    # ── answers ────────────────────────────────────────────────────────────
    op.create_table(
        'answers',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('question_id', sa.Integer(),
                  sa.ForeignKey('questions.id')),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('audio_path', sa.Text(), nullable=True),
        sa.Column('duration', sa.Float(), nullable=True),
    )

    # ── evaluations ────────────────────────────────────────────────────────
    op.create_table(
        'evaluations',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('answer_id', sa.Integer(), sa.ForeignKey('answers.id')),
        sa.Column('score', sa.Float(), nullable=True),
        sa.Column('technical_accuracy', sa.Float(), nullable=True),
        sa.Column('communication', sa.Float(), nullable=True),
        sa.Column('grammar', sa.Float(), nullable=True),
        sa.Column('fluency', sa.Float(), nullable=True),
        sa.Column('filler_words', sa.Integer(), nullable=True),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('suggestions', sa.Text(), nullable=True),
        sa.Column('metrics', sa.JSON(), nullable=True),
    )

    # ── interview_results ──────────────────────────────────────────────────
    op.create_table(
        'interview_results',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('interview_id', sa.Integer(),
                  sa.ForeignKey('interviews.id'), unique=True),
        sa.Column('overall_score', sa.Float(), nullable=True),
        sa.Column('answer_quality_score', sa.Float(), nullable=True),
        sa.Column('communication_score', sa.Float(), nullable=True),
        sa.Column('performance_score', sa.Float(), nullable=True),
        sa.Column('role_knowledge_score', sa.Float(), nullable=True),
        sa.Column('technical_score', sa.Float(), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('strengths', sa.JSON(), nullable=True),
        sa.Column('weaknesses', sa.JSON(), nullable=True),
        sa.Column('improvement_areas', sa.JSON(), nullable=True),
        sa.Column('key_points', sa.JSON(), nullable=True),
        sa.Column('recommendations', sa.JSON(), nullable=True),
        sa.Column('result_label', sa.String(), nullable=True),
    )

    # ── progress ───────────────────────────────────────────────────────────
    op.create_table(
        'progress',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(),
                  sa.ForeignKey('users.id'), unique=True),
        sa.Column('total_interviews', sa.Integer(), default=0),
        sa.Column('average_score', sa.Integer(), default=0),
        sa.Column('skill_breakdown', sa.JSON(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('progress')
    op.drop_table('interview_results')
    op.drop_table('evaluations')
    op.drop_table('answers')
    op.drop_table('questions')
    op.drop_table('interviews')
    op.drop_table('resumes')
    op.drop_table('user_profiles')
    op.drop_table('users')
