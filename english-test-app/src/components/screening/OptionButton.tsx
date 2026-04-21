interface OptionButtonProps {
  label: string
  index: number
  disabled: boolean
  showFeedback: boolean
  isCorrect: boolean
  isChosen: boolean
  onClick: (index: number) => void
  large?: boolean
}

export function OptionButton({ label, index, disabled, showFeedback, isCorrect, isChosen, onClick, large }: OptionButtonProps) {
  let cls = `w-full py-4 px-5 rounded-xl font-bold border-2 transition-all duration-150 ${large ? 'text-3xl' : 'text-xl'} `
  if (!showFeedback) {
    cls += 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 active:scale-[0.98]'
  } else if (isCorrect) {
    cls += 'border-emerald-500 bg-emerald-50 text-emerald-700'
  } else if (isChosen) {
    cls += 'border-rose-400 bg-rose-50 text-rose-700'
  } else {
    cls += 'border-slate-100 bg-slate-50 text-slate-400 opacity-40'
  }
  return <button className={cls} disabled={disabled} onClick={() => onClick(index)}>{label}</button>
}
