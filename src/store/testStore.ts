import { create } from 'zustand'
import { type TestAnswer, type TestResult, scoreTest, saveResult } from '@/lib/scoring'

interface TestStore {
  // 현재 테스트 진행 상태
  currentStep: number          // 0~11 (문항 인덱스)
  answers: TestAnswer[]
  isComplete: boolean
  result: TestResult | null

  // 액션
  selectAnswer: (answer: TestAnswer) => void
  goBack: () => void
  resetTest: () => void
  setResult: (result: TestResult) => void
}

export const useTestStore = create<TestStore>((set, get) => ({
  currentStep: 0,
  answers: [],
  isComplete: false,
  result: null,

  selectAnswer: (answer) => {
    const { currentStep, answers } = get()
    const newAnswers = [...answers.filter((a) => a.questionId !== answer.questionId), answer]
    const isComplete = currentStep >= 11

    set({
      answers: newAnswers,
      currentStep: isComplete ? 11 : currentStep + 1,
      isComplete,
    })

    if (isComplete) {
      const result = scoreTest(newAnswers)
      saveResult(result)
      set({ result })
    }
  },

  goBack: () => {
    const { currentStep, answers } = get()
    if (currentStep === 0) return
    const prevStep = currentStep - 1
    // 이전 문항 답변 제거
    const prevQuestionId = prevStep + 1
    set({
      currentStep: prevStep,
      answers: answers.filter((a) => a.questionId !== prevQuestionId),
      isComplete: false,
      result: null,
    })
  },

  resetTest: () => set({
    currentStep: 0,
    answers: [],
    isComplete: false,
    result: null,
  }),

  setResult: (result) => set({ result }),
}))
