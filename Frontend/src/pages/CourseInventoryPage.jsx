import { useParams } from "react-router-dom"
import InventorySection from "./InventorySection"

const CourseInventoryPage = () => {
  const { courseCode } = useParams()

  // Convert course code from URL to lowercase for track
  const track = courseCode?.toLowerCase() || ""
  
  // Create title from course code
  const title = `${courseCode?.toUpperCase()} Inventory`
  const description = `${courseCode?.toUpperCase()} consumables and tools.`

  return (
    <InventorySection
      title={title}
      description={description}
      track={track}
    />
  )
}

export default CourseInventoryPage
