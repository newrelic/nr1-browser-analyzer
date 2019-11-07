const MINUTE = 60000
const HOUR = 60*MINUTE
const DAY= 24*HOUR

export default function timePicker(props) {
  if(props.begin_time && props.end_time){
    return `SINCE ${props.begin_time} UNTIL ${props.end_time} `
  } 
  else if(props.duration <= HOUR) {
    return `SINCE ${props.duration/1000/60} MINUTES AGO`
  } 
  else if(props.duration / HOUR) {
    return `SINCE ${props.duration/1000/60} HOURS AGO`
  }
  else if(props.duration <= DAY) {
    return `SINCE ${props.duration/1000/60} DAYS AGO`
  }
  return `SINCE ${props.duration/1000/60} MINUTES AGO`
}
