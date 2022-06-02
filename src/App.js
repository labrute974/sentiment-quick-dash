import logo from './logo.svg'
import './App.css'
import { useEffect, useState } from 'react'
import { Button, LinearProgress } from '@mui/material'
import _ from 'lodash'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

function App() {
  const [ scores, setScores ] = useState([])
  const [ loading, setLoading ] = useState(false)

  const onRefresh = () => {
    setLoading(() => true)
    fetch('https://us-central1-cookeasy-dev.cloudfunctions.net/api')
      .then(res => res.json())
      .then(messages => {
        const byKeywords = _.flattenDeep(messages.map((m, index) => m.entities))
        console.log(byKeywords)
        const scores = _.uniq(byKeywords.map(k => k.keyword))
          .map(keyword => {
            const results = byKeywords.filter(b => b.keyword === keyword)
            return {
              keyword,
              score: results.reduce((acc, next) => acc + next.sentiment.score * 50 + 50, 0) / results.length
            }
          })

        setScores(() => scores)
      })
      .finally(() => {
        setLoading(() => false)
      })
  }

  useEffect(() => {
    onRefresh()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Slack Shrink
        </p>

        <Button variant="contained" onClick={onRefresh} disabled={loading}>
          { !loading ? 'Refresh' :  'Refreshing'}
        </Button>
      </header>
      <LinearProgress style={{ display: loading ? 'block' : 'none' }} />

      <div className='panel'>
          <RadarChart cx="300" cy="250" outerRadius="80%" width={600} height={500} data={scores}>
            <PolarGrid />
            <PolarAngleAxis dataKey="keyword" />
            <PolarRadiusAxis />
            <Radar name="score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </RadarChart>
      </div>
    </div>
  );
}

export default App;
