'use client';

interface ResultsPerPageSelectProps {
  changeAction: (targetResults: number) => void,
  resultsOptions?: number[],
  defaultValue?: number,
}

export default function ResultsPerPageSelect(props: ResultsPerPageSelectProps){
  const DEFAULT_RESULTS_OPTIONS = [5, 10, 20];
  const resultsOptions = props.resultsOptions || DEFAULT_RESULTS_OPTIONS;
  const defaultValue = props.defaultValue || DEFAULT_RESULTS_OPTIONS[Math.floor(DEFAULT_RESULTS_OPTIONS.length / 2)]
  return (
      <label>
        Notifications per page
        <select defaultValue={defaultValue} onChange={(e) => {
          props.changeAction(Number.parseInt(e.target.value))
        }}>
          {
            resultsOptions.map((option, index) => {
              return (
                <option key={index} value={option}>{option}</option>
              )
            })
          }
        </select>
      </label>
  )
}