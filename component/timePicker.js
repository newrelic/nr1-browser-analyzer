const MINUTE = 60000
const HOUR = 60*MINUTE
const DAY = 24*HOUR

export default function timePicker(props) {
  if(!props) return "SINCE 30 MINUTES AGO"
  if(props.begin_time && props.end_time){
    return `SINCE ${props.begin_time} UNTIL ${props.end_time} `
  } 
  else if(props.duration <= HOUR) {
    return `SINCE ${props.duration/ MINUTE} MINUTES AGO`
  } 
  else if(props.duration <= DAY) {
    return `SINCE ${props.duration/ HOUR} HOURS AGO`
  } 
  else {
    return `SINCE ${props.duration / DAY} DAYS AGO`
  }
}
