import moment from 'moment'
import knex from 'knexClient'

function translateDate(events) {
  events.forEach(function(event) {
    event.starts_at = new Date(event.starts_at)
    event.ends_at = new Date(event.ends_at)
  })
  return events
}

function createTab(daysAvailability) {
  let tab = new Array(daysAvailability);
  for (let day = 0; day < daysAvailability; day++) {
    tab[day] = new Array(24 * 2)
    for (let hour = 0; hour < 24 * 2; hour++) {
      tab[day][hour] = 0
    }
  }
  return tab;
}

function affTab(tab, daysAvailability, dateStart) {
  for (let day = 0; day < daysAvailability; day++) {
    console.log(moment(dateStart).add(day, 'day').format("YYYY-MM-DD"))
    for (let hour = 0; hour < 24 * 2; hour++) {
      if (tab[day][hour] == true) {
        var new_date = moment(dateStart).add(day, 'day').add(hour / 2, 'hour').format("YYYY-MM-DD HH:mm");
        console.log(new_date)
      }
    }
  }
}

function affAvailabilities(availabilities) {
  availabilities.forEach(function (availability) {
    console.log(availability.date)
    console.log(availability.slots)
  })
}

function createAvailabilities(tab, daysAvailability, dateStart, res) {
  let availability
  for (let day = 0; day < daysAvailability; day++) {
    for (let hour = 0; hour < 24 * 2; hour++) {
      if (tab[day][hour] == true) {
         availability = {date: new Date(dateStart + day * (24 * 60 * 60 * 1000)), slots: []}
      }
      while (tab[day][hour] == true) {
        availability.slots.push(moment(0).hour(hour / 2).minute((hour % 2) * 30).format("HH:mm"))
        hour++
        if (tab[day][hour] != true) {
          hour--
          res.push(availability)
        }
      }
    }
  }
  return availability
}

export default async function getAvailabilities(date) {

  // compute last date
  const daysAvailability = 7
  const dateStart = moment(date).hour(0).minute(0).second(0).format("YYYY-MM-DD HH:mm:ss")
  console.log(dateStart)
  const dateEnd = moment(dateStart).add(daysAvailability, 'day').format("YYYY-MM-DD HH:mm:ss")
  console.log(dateEnd)

  const tab = createTab(daysAvailability)

  // get all weekly opennings before last date
  const openings = await knex('events').where({kind: 'opening'}).andWhere('ends_at', '<', dateEnd)
    .then((events) => {
      translateDate(events)
      return events
    })

  const appointments = await knex('events').where({kind: 'appointment'}).andWhere('ends_at', '<', dateEnd)
    .then((appointments) => {
      translateDate(appointments)
      return appointments
    })

  const eventsRecuring = await knex('events').where('starts_at', '<', dateStart)
    .andWhere('weekly_recurring', '=', true)
    .then((events) => {
      translateDate(events)
      return events
    })
  const events = await knex('events').where('starts_at', '>', dateStart).where('ends_at', '<', dateEnd)
    .then((events) => {
      translateDate(events)
      return events
    })

  eventsRecuring.forEach(function(event) {
    let day = event.starts_at.getDay()
    let hour = event.starts_at.getHours()
    let minute = event.starts_at.getMinutes()

    if (event.kind == 'opening') {
      tab[day][hour * 2 + minute / 30] = true
    }
  })
  events.forEach(function(event) {
    let day = event.starts_at.getDay()
    let hour = event.starts_at.getHours()
    let minute = event.starts_at.getMinutes()

    if (event.kind == 'opening') {
      tab[day][hour * 2 + minute / 30] = true
    }
  })
  eventsRecuring.forEach(function(event) {
    let day = event.starts_at.getDay()
    let hour = event.starts_at.getHours()
    let minute = event.starts_at.getMinutes()

    if (event.kind == 'appointment') {
      tab[day][hour * 2 + minute / 30] = false
    }
  })
  events.forEach(function(event) {
    let day = event.starts_at.getDay()
    let hour = event.starts_at.getHours()
    let minute = event.starts_at.getMinutes()

    if (event.kind == 'appointment') {
      tab[day][hour * 2 + minute / 30] = false
    }
  })

  //affTab(tab, daysAvailability, dateStart)
  let res = new Array()
  createAvailabilities(tab, daysAvailability, dateStart, res)
  console.log('finished')
  console.log(res)
  affAvailabilities(res)
  // Implement your algorithm here
  // get all appointments bewteen date and last date  // Implement your algorithm here
}
