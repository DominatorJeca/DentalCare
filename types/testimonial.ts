export type TestimonialStatus = "pending" | "approved" | "rejected"

export interface Testimonial {
  id: string
  name: string
  treatment: string
  rating: number
  text: string
  status: TestimonialStatus
  created_at: string
}
