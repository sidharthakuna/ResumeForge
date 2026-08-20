
### Skill entity — no proficiency field

Skill stores only resume_id and name. No proficiency/rating field
(Beginner/Intermediate/Advanced, star ratings, etc.) was added.

Reason: most professional resumes present skills as a plain list,
not a rated list — self-assessed proficiency is low-signal to
recruiters (subjective, no calibration across candidates) and adds
real template-rendering complexity (bars, stars, percentages) for
little benefit. A plain skill list is the more common, more
credible convention for a job-focused resume builder.

If a rating system is wanted later, it's a cheap additive change
(one nullable enum column) rather than something that needs to be
designed in now.

### Remaining child entities (Skill, Experience, Education done)

Working list for the rest of Resume's children: Project,
Certification, Achievement, SocialLink.

Note: this list was reconstructed mid-project, not copied from an
original written spec — the initial review document only said
"seven children" and gave Education/Experience/Skill as examples,
without enumerating the rest. Treat this list as a working plan,
not a confirmed original design — revisit if it stops fitting what
the resume builder actually needs.
