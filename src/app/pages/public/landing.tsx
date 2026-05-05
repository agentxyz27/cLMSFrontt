/**
 * landing.tsx
 *
 * Public landing page for cLMS.
 * Static page — no API calls.
 * Describes cLMS and its Core Features
 */

import { Card } from '@/components/ui/card'

export default function Landing() {

  return (
    <div className='flex min-h-screen justify-center '>
      <Card className='flex justify-center h-fit p-12'>
        <img src='/clmsFav.svg'
          className='h-1/4'
        />

          <p>
            The first FlagShip Service of EduForge Solutions.
            A digital Mathematics learning tool for Grade 4–6 students
          </p>
          <p>
            Designed to help teachers manage lessons and track student
            progress, and help students learn at their own pace.
          </p>
      </Card>

    </div>
  )
}