import { useEffect, useRef, useState } from 'react'
import './App.css'

const initialApplications = [
  {
    id: 'sample-notion',
    company: 'Notion',
    initials: 'N',
    color: 'violet',
    role: 'Product Designer',
    location: 'San Francisco, CA',
    status: 'Interviewing',
    deadline: '2026-11-28',
  },
  {
    id: 'sample-stripe',
    company: 'Stripe',
    initials: 'S',
    color: 'blue',
    role: 'Software Engineer',
    location: 'Remote',
    status: 'Applied',
    deadline: '2026-12-02',
  },
  {
    id: 'sample-figma',
    company: 'Figma',
    initials: 'F',
    color: 'orange',
    role: 'UX Design Intern',
    location: 'New York, NY',
    status: 'Saved',
    deadline: '2026-12-05',
  },
  {
    id: 'sample-atlassian',
    company: 'Atlassian',
    initials: 'A',
    color: 'cyan',
    role: 'Associate Product Manager',
    location: 'Austin, TX',
    status: 'Incomplete',
    deadline: '2026-12-08',
  },
  {
    id: 'sample-linear',
    company: 'Linear',
    initials: 'L',
    color: 'dark',
    role: 'Frontend Developer',
    location: 'Remote',
    status: 'Applied',
    deadline: '2026-12-12',
  },
]

const statusClassNames = {
  Interviewing: 'status-interviewing',
  Applied: 'status-applied',
  Saved: 'status-saved',
  Incomplete: 'status-incomplete',
  Accepted: 'status-accepted',
}

const initialFormValues = {
  role: '',
  company: '',
  url: '',
  location: '',
  deadline: '',
  status: 'Saved',
}

const applicationStatuses = [
  'Saved',
  'Incomplete',
  'Applied',
  'Interviewing',
  'Accepted',
]

function getCompanyInitials(companyName) {
  return companyName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function formatDeadline(deadline) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(`${deadline}T12:00:00`))
}

function App() {
  const [applications, setApplications] = useState(initialApplications)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formValues, setFormValues] = useState({ ...initialFormValues })
  const [formErrors, setFormErrors] = useState({})
  const dialogRef = useRef(null)
  const jobTitleRef = useRef(null)
  const companyRef = useRef(null)
  const urlRef = useRef(null)

  const submittedCount = applications.filter((application) =>
    ['Applied', 'Interviewing'].includes(application.status),
  ).length
  const interviewCount = applications.filter(
    (application) => application.status === 'Interviewing',
  ).length
  const attentionCount = applications.filter((application) =>
    ['Saved', 'Incomplete'].includes(application.status),
  ).length
  const upcomingDeadlines = applications
    .filter((application) => application.deadline)
    .sort((first, second) => first.deadline.localeCompare(second.deadline))

  function openForm() {
    setFormValues({ ...initialFormValues })
    setFormErrors({})
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setFormValues({ ...initialFormValues })
    setFormErrors({})
  }

  function updateApplicationStatus(applicationId, status) {
    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === applicationId
          ? { ...application, status }
          : application,
      ),
    )
  }

  useEffect(() => {
    if (!isFormOpen) return undefined

    const previousFocus = document.activeElement
    const dialog = dialogRef.current
    const firstInput = dialog?.querySelector('#job-title')
    firstInput?.focus()

    function handleDialogKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsFormOpen(false)
        setFormValues({ ...initialFormValues })
        setFormErrors({})
        return
      }

      if (event.key !== 'Tab' || !dialog) return

      const focusableElements = dialog.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled])',
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    window.addEventListener('keydown', handleDialogKeyDown)
    return () => {
      window.removeEventListener('keydown', handleDialogKeyDown)
      previousFocus?.focus()
    }
  }, [isFormOpen])

  function handleFieldChange(event) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const cleanedValues = {
      role: formValues.role.trim(),
      company: formValues.company.trim(),
      url: formValues.url.trim(),
      location: formValues.location.trim(),
      deadline: formValues.deadline,
      status: formValues.status,
    }
    const errors = {}

    if (!cleanedValues.role) errors.role = 'Enter a job title.'
    if (!cleanedValues.company) errors.company = 'Enter a company name.'

    if (cleanedValues.url) {
      try {
        const postingUrl = new URL(cleanedValues.url)
        if (!['http:', 'https:'].includes(postingUrl.protocol)) {
          errors.url = 'Enter a valid web address starting with http:// or https://.'
        }
      } catch {
        errors.url = 'Enter a valid web address starting with http:// or https://.'
      }
    }

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      if (errors.role) jobTitleRef.current?.focus()
      else if (errors.company) companyRef.current?.focus()
      else urlRef.current?.focus()
      return
    }

    const newApplication = {
      id: globalThis.crypto?.randomUUID
        ? globalThis.crypto.randomUUID()
        : `application-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      company: cleanedValues.company,
      initials: getCompanyInitials(cleanedValues.company),
      color: 'blue',
      role: cleanedValues.role,
      location: cleanedValues.location,
      status: cleanedValues.status,
      deadline: cleanedValues.deadline,
      url: cleanedValues.url,
    }

    setApplications((currentApplications) => [
      ...currentApplications,
      newApplication,
    ])
    closeForm()
  }

  return (
    <div className="app-shell" id="dashboard">
      <aside className="sidebar">
        <a className="brand" href="#dashboard" aria-label="AppTrack home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path
                d="M7 23.5 14.8 7l4.3 9.1 2.4-4.8L27 23.5h-5.3l-2.7-5.7-2.8 5.7H7Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span>apptrack</span>
        </a>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#dashboard" aria-current="page">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
              <rect x="13.5" y="3.5" width="7" height="4" rx="1.5" />
              <rect x="13.5" y="10.5" width="7" height="10" rx="1.5" />
              <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
            </svg>
            <span>Dashboard</span>
          </a>
          <a className="nav-link" href="#applications">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <path d="M8 3.5v3M16 3.5v3M4 9.5h16M8 13h3M8 16.5h6" />
            </svg>
            <span>My applications</span>
            <span className="nav-count">{applications.length}</span>
          </a>
        </nav>

        <div className="sidebar-note">
          <span className="note-icon" aria-hidden="true">✦</span>
          <p>Small steps add up.</p>
          <span>Keep your job search moving forward.</span>
        </div>

        <div className="profile">
          <span className="avatar">JD</span>
          <span className="profile-copy">
            <strong>Jordan Davis</strong>
            <span>Job seeker</span>
          </span>
          <span className="profile-menu" aria-hidden="true">···</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>Dashboard</strong>
          </div>
          <div className="topbar-actions">
            <span className="today-label">Saturday, November 21</span>
            <button className="icon-button notification-button" type="button" aria-label="Notifications">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
              </svg>
              <span className="notification-dot" />
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-section" aria-labelledby="welcome-title">
            <div>
              <p className="eyebrow">YOUR JOB SEARCH, IN ONE PLACE</p>
              <h1 id="welcome-title">Good morning, Jordan <span aria-hidden="true">✦</span></h1>
              <p className="welcome-copy">A little progress every day gets you closer to the right opportunity.</p>
            </div>
            <button
              className="primary-button"
              type="button"
              aria-haspopup="dialog"
              onClick={openForm}
            >
              <span aria-hidden="true">+</span>
              Add application
            </button>
          </section>

          <section className="stats-grid" aria-label="Application summary">
            <article className="stat-card">
              <div className="stat-topline">
                <span className="stat-icon icon-blue" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3.5v3M16 3.5v3M4 9.5h16" /></svg>
                </span>
                <span className="stat-caption">ALL TIME</span>
              </div>
              <div className="stat-number">{applications.length}</div>
              <div className="stat-label">Total applications</div>
            </article>
            <article className="stat-card">
              <div className="stat-topline">
                <span className="stat-icon icon-green" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7" /></svg>
                </span>
                <span className="stat-caption">IN PROGRESS</span>
              </div>
              <div className="stat-number">{submittedCount}</div>
              <div className="stat-label">Submitted</div>
            </article>
            <article className="stat-card">
              <div className="stat-topline">
                <span className="stat-icon icon-orange" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7M4 8h16l-1 12H5L4 8Z" /><path d="M4.5 12h15M10 12v2h4v-2" /></svg>
                </span>
                <span className="stat-caption">NEXT STEP</span>
              </div>
              <div className="stat-number">{interviewCount}</div>
              <div className="stat-label">Interviewing</div>
            </article>
            <article className="stat-card">
              <div className="stat-topline">
                <span className="stat-icon icon-red" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M12 3.5 21 20H3l9-16.5Z" /><path d="M12 9v4.5M12 17h.01" /></svg>
                </span>
                <span className="stat-caption">TO REVIEW</span>
              </div>
              <div className="stat-number">{attentionCount}</div>
              <div className="stat-label">Need attention</div>
            </article>
          </section>

          <div className="dashboard-columns">
            <section className="applications-panel" id="applications" aria-labelledby="applications-title">
              <div className="panel-heading">
                <div>
                  <h2 id="applications-title">My applications</h2>
                  <p>Your opportunities at a glance</p>
                </div>
                <a className="text-link" href="#applications">
                  View all <span aria-hidden="true">→</span>
                </a>
              </div>

              <div className="application-table" role="table" aria-label="Your applications">
                <div className="table-header" role="row">
                  <span role="columnheader">POSITION</span>
                  <span role="columnheader">STATUS</span>
                  <span role="columnheader">DEADLINE</span>
                  <span className="table-action-heading" role="columnheader"> </span>
                </div>
                {applications.map((application) => (
                  <div className="application-row" role="row" key={application.id}>
                    <div className="position-cell" role="cell">
                      <span className={`company-logo logo-${application.color}`} aria-hidden="true">
                        {application.initials}
                      </span>
                      <span className="position-copy">
                        <strong>{application.role}</strong>
                        <span>
                          {application.company}
                          {application.location && (
                            <>
                              <span className="location-separator">·</span>
                              {application.location}
                            </>
                          )}
                        </span>
                      </span>
                    </div>
                    <div role="cell">
                      <label className={`status-control ${statusClassNames[application.status]}`}>
                        <span className="status-dot" aria-hidden="true" />
                        <select
                          className="status-select"
                          aria-label={`Update status for ${application.role} at ${application.company}`}
                          value={application.status}
                          onChange={(event) =>
                            updateApplicationStatus(application.id, event.target.value)
                          }
                        >
                          {applicationStatuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <span className="deadline-cell" role="cell">
                      {application.deadline ? formatDeadline(application.deadline) : 'No deadline'}
                    </span>
                    <button className="row-menu" type="button" aria-label={`More options for ${application.role}`}>···</button>
                  </div>
                ))}
              </div>
            </section>

            <aside className="right-column" aria-label="Job search reminders">
              <section className="deadlines-panel" aria-labelledby="deadlines-title">
                <div className="panel-heading compact-heading">
                  <div>
                    <h2 id="deadlines-title">Coming up</h2>
                    <p>Keep an eye on these</p>
                  </div>
                  <span className="calendar-mark" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3.5v3M16 3.5v3M4 9.5h16" /></svg>
                  </span>
                </div>
                <div className="deadline-list">
                  {upcomingDeadlines.length > 0 ? (
                    upcomingDeadlines.map((application) => (
                      <article className="deadline-item" key={application.id}>
                        <span className="deadline-marker marker-blue" />
                        <div>
                          <strong>{application.role}</strong>
                          <span>{application.company} · Application due</span>
                        </div>
                        <time dateTime={application.deadline}>
                          {formatDeadline(application.deadline)}
                        </time>
                      </article>
                    ))
                  ) : (
                    <p className="empty-deadlines">No upcoming deadlines.</p>
                  )}
                </div>
                <a className="calendar-link" href="#applications">See applications <span aria-hidden="true">→</span></a>
              </section>

              <section className="encouragement-card">
                <span className="encouragement-icon" aria-hidden="true">✦</span>
                <p className="encouragement-label">A NOTE FOR YOU</p>
                <h2>Every application is a step forward.</h2>
                <p>Stay consistent, celebrate the small wins, and trust your progress.</p>
                <span className="sparkle sparkle-one" aria-hidden="true">✳</span>
                <span className="sparkle sparkle-two" aria-hidden="true">✦</span>
              </section>
            </aside>
          </div>
        </div>
      </main>

      {isFormOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm()
          }}
        >
          <section
            ref={dialogRef}
            className="application-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-dialog-title"
            aria-describedby="application-dialog-description"
          >
            <div className="dialog-heading">
              <div>
                <p className="dialog-eyebrow">NEW OPPORTUNITY</p>
                <h2 id="application-dialog-title">Add an application</h2>
                <p id="application-dialog-description">
                  Keep the details together so you can stay on top of your search.
                </p>
              </div>
              <button
                className="dialog-close"
                type="button"
                aria-label="Close application form"
                onClick={closeForm}
              >
                ×
              </button>
            </div>

            <form className="application-form" noValidate onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="job-title">Job title <span aria-hidden="true">*</span></label>
                  <input
                    ref={jobTitleRef}
                    autoComplete="organization-title"
                    id="job-title"
                    name="role"
                    type="text"
                    placeholder="e.g. Product Designer"
                    value={formValues.role}
                    onChange={handleFieldChange}
                    aria-invalid={Boolean(formErrors.role)}
                    aria-describedby={formErrors.role ? 'job-title-error' : undefined}
                    required
                  />
                  {formErrors.role && <p className="field-error" id="job-title-error">{formErrors.role}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="company-name">Company name <span aria-hidden="true">*</span></label>
                  <input
                    ref={companyRef}
                    autoComplete="organization"
                    id="company-name"
                    name="company"
                    type="text"
                    placeholder="e.g. Acme Inc."
                    value={formValues.company}
                    onChange={handleFieldChange}
                    aria-invalid={Boolean(formErrors.company)}
                    aria-describedby={formErrors.company ? 'company-name-error' : undefined}
                    required
                  />
                  {formErrors.company && <p className="field-error" id="company-name-error">{formErrors.company}</p>}
                </div>

                <div className="form-field form-field-wide">
                  <label htmlFor="posting-url">Job posting URL <span className="optional-label">Optional</span></label>
                  <input
                    ref={urlRef}
                    autoComplete="url"
                    id="posting-url"
                    name="url"
                    type="url"
                    inputMode="url"
                    placeholder="https://company.com/careers/job"
                    value={formValues.url}
                    onChange={handleFieldChange}
                    aria-invalid={Boolean(formErrors.url)}
                    aria-describedby={formErrors.url ? 'posting-url-error' : undefined}
                  />
                  {formErrors.url && <p className="field-error" id="posting-url-error">{formErrors.url}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="application-location">Location <span className="optional-label">Optional</span></label>
                  <input
                    autoComplete="address-level2"
                    id="application-location"
                    name="location"
                    type="text"
                    placeholder="e.g. Remote or Chicago, IL"
                    value={formValues.location}
                    onChange={handleFieldChange}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="application-deadline">Application deadline <span className="optional-label">Optional</span></label>
                  <input
                    id="application-deadline"
                    name="deadline"
                    type="date"
                    value={formValues.deadline}
                    onChange={handleFieldChange}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="application-status">Application status</label>
                  <select
                    id="application-status"
                    name="status"
                    value={formValues.status}
                    onChange={handleFieldChange}
                  >
                    {applicationStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="required-note"><span aria-hidden="true">*</span> Required fields</p>
              <div className="form-actions">
                <button className="secondary-button" type="button" onClick={closeForm}>
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  Save application
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
