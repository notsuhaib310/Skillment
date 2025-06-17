const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in/api"

export async function validateOrganization(orgName: string) {
  try {
    const response = await fetch(`${API_URL}/organizations/validate/${orgName}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error validating organization:", error)
    return { success: false, error: "Failed to validate organization name" }
  }
} 