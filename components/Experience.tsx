import { TRUTH } from '@/content/truth'
export function Experience() {
  return (
    <>
      {TRUTH.career.map((job) => (
        <div className="career-row" key={job.company}>
          <div className="mono muted">{job.period}</div>
          <div>
            <p>
              {job.role} · {job.company}
            </p>
            <p className="career-description">{job.description}</p>
          </div>
        </div>
      ))}
      <div className="credentials">
        <div>
          <p className="mono muted">Education</p>
          <p>{TRUTH.education.degree}</p>
          <p className="muted">
            {TRUTH.education.institution}
            <br />
            {TRUTH.education.location} · {TRUTH.education.graduation}
          </p>
        </div>
        <div>
          <p className="mono muted">Credentials</p>
          {TRUTH.certifications.map((cert) => (
            <p key={cert.title}>
              {cert.title}
              <br />
              <span className="muted">{cert.issuer}</span>
            </p>
          ))}
        </div>
      </div>
    </>
  )
}
