
const BtnFilter = ({ label, isActive, onClick }) => {
  const activeStyle = "bg-dark-grey text-background"
  const baseStyle = "cursor-pointer self-start rounded-md text-[1rem] cursor-pointer hover:bg-dark-grey hover:text-background border-[0.11rem] border-grey font-[400] py-[0.4rem] px-3"

  return (
    <button onClick={onClick} className={`${isActive ? activeStyle: ""} ${baseStyle}`}>{label}</button>
  )
}

export default BtnFilter