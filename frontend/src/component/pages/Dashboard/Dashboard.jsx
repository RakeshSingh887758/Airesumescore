import React from 'react'
import style from './Dashboard.module.css';
import { TowerIcon } from '../../../assets/icons/towericon';

function Dashboard() {
  return (
    <div className={style.Dashboard}>
      <div className={style.DashboardLeft}>
        <div className={style.Dashboardheader}>
          <div className={style.Dashboardheadertitle}>Smart Resume Screening</div>
          <div className={style.Dashboardheaderlargetitle}>Resume Match Score</div>
        </div>
        <div className={style.alertInfo}>
          <div>🔔 Important Instruction</div>
          <div className={style.DashboardInstruction}>
            📝Please paste the complete job description in th 'Job Description' field before upload the resume.
          </div>
          <div>
            ❔ Only PDF format (.pdf) resumes are Accepted.
          </div>

          <div className={style.DashboardUploadResume}>
            <div className={style.DashboarResumeBlock}>
              Upload Your Resume
            </div>
            <div className={style.DashboardinputField}>
              <label htmlFor='inputfield'>Upload Resume</label>
              <input type='file' accept='.pdf' id='inputfield' />
            </div>

          </div>
          <div className={style.Dashboardjobdsc}>
            <textarea placeholder='Paste your job description...'
             rows={5} cols={25}/>
             <div className={style.analysebutton}>
              Analyze
             </div>

          </div>

        </div>
      </div>
      <div className={style.DashboardRight}>
        <div className={style.DashboardrighttopCard}>
          <div>Analyze with A.I.</div>
          <img className={style.DashboardProfileImg} src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTluYoCu7ux3synmi_Akw92BIhgoj0jDt45AUWW7_2hcwu_48B6I1yu4Yjj&s=10' alt='No Image Found'/>
            <h4>Pooja</h4>
        </div>

        <div className={style.DashboardrightBottomCard}>
          <div>Result</div>
          <div className={style.Dashboarpercent}>
            <h1>75%</h1>
            <div><TowerIcon/></div>
          </div>
          <div className={style.DashboarResumeresultdesc}>
            <b>Feedback</b>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga itaque assumenda ducimus illum ex numquam nostrum perferendis debitis molestiae quod asperiores, autem odio eveniet distinctio, soluta eligendi dolorum perspiciatis inventore?</p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard