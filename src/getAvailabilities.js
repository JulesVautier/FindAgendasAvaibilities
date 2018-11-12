import moment from 'moment'
import knex from 'knexClient'


const UNDEFINED =   0
const OPENING =     1
const APPOINTMENT = 2

function createTab(nbDays) {
    let tab = new Array(nbDays)
    for (let day = 0; day < nbDays; day++) {
        tab[day] = new Array(24 * 2)
        for (let hour = 0; hour < 24 * 2; hour++)
            tab[day][hour] = UNDEFINED
    }
    return tab
}

async function feedTab(tab, startDate, endDate) {
    let events = await knex('events')
        .where('ends_at', '<',  new Date(endDate))
        .then(function (events) {
            return (events)
        })

    events.forEach(function (event) {
        const day = moment(event.starts_at).day()
        let startsAt = moment(event.starts_at)
        let endsAt = moment(event.ends_at)
        let value = UNDEFINED

        if (event.kind == 'opening')
            value = OPENING
        else
            value = APPOINTMENT

        if (event.weekly_recurring == true ||
            (event.weekly_recurring != true && startsAt.isSameOrAfter(startDate))) {
            let hour = startsAt.hour() * 2 + startsAt.minute() / 30
            while (startsAt.isBefore(endsAt)) {
                if (value > tab[day][hour])
                    tab[day][hour] = value
                startsAt.add(30, 'minute')
                hour++
            }
        }
    })
    return tab
}

// This function aff the tab for debug purpose
function affTab(tab) {
    for (let day = 0; day < tab.length; day++) {
        for (let hour = 0; hour < 24 * 2; hour++) {
            if (tab[day][hour] != 0)
                console.log(tab[day][hour], day, hour)
        }
        console.log('new day', day)
    }
}

function createAvailabilities(tab, startDate) {
    let availabilities = []
    let date
    let availability = null
    let startDay = startDate.day()

    for (let day = 0; day < tab.length; day++) {
        let index = day + startDay % 7
        date = startDate.clone().add(day, 'day')
        date = String(new Date(date))
        availability = {date: date, slots: []}
        for (let hour = 0; hour < 24 * 2; hour++) {
            if (tab[index][hour] == 1) {
                availability.slots.push(moment(0).hour(hour / 2).minute((hour % 2) * 30).format('H:mm'))
            }
        }
        availabilities.push(availability)
    }
    return availabilities;
}


export default async function getAvailabilities(date) {
  // Implement your algorithm here
    const nbDays = 7
    const startDate = moment(date)
    const endDate = moment(date).add(nbDays, 'day')

    let tab = createTab(nbDays)
    await feedTab(tab, startDate.clone(), endDate.clone())
    const availabilities = createAvailabilities(tab, startDate)
    console.log(availabilities)
    return availabilities
}
