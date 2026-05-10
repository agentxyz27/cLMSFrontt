import { ClassHealthPanel } from "../components/analysisPanel/classHealthPanel"
import { useParams } from "react-router-dom"

export default function WalangWala() {
  const { roomId } = useParams()  // 👈 inside here
  console.log('classRoomId:', roomId)

  return (
    <div>
      <ClassHealthPanel classRoomId={Number(roomId)} />
    </div>
  )
}