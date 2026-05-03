/**
 * landing.tsx
 *
 * Public landing page for cLMS.
 * Static page — no API calls.
 * Describes cLMS and Dolores Central School.
 *
 */

import { Card } from "@/shared/components/ui/card";


export default function Landing() {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">

      <img 
      src='/companyName.png' 
      alt='Company Logo' 
      className='w-lg mb-6' />

      <img 
      src='/companyName.png' 
      alt='Company Logo' 
      className='w-lg mb-6' />

      <div className="flex-1 max-w-full bg-amber-300">
        <Card>
          <h1 className="text-3xl font-bold mb-4">Welcome to cLMS</h1>
          <p className="text-lg">
            cLMS is a comprehensive learning management system designed to enhance the educational experience for both students and educators.
          </p>
        </Card>
      </div>

      <img 
        src='/companyName.png' 
        alt='Company Logo' 
        className='w-lg mb-6' />

    </div>
  )
}