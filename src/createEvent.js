import knex from '../knexClient';

export default function createEvent(dateStart) {
  knex('events')
    .insert(  [{
        kind: 'opening',
        starts_at: new Date('2014-08-04 09:30'),
        ends_at: new Date('2014-08-04 12:30'),
        weekly_recurring: true,
      },
      {
        kind: 'opening',
        starts_at: new Date('2015-08-11 09:30'),
        ends_at: new Date('2015-08-11 12:30'),
        weekly_recurring: true,
      },
      {
        kind: 'appointment',
        starts_at: new Date('2014-08-11 10:30'),
        ends_at: new Date('2014-08-11 11:30'),
      },
      {
        kind: 'appointment',
        starts_at: new Date('2014-08-15 7:30'),
        ends_at: new Date('2014-08-15 8:30'),
      }]
    ).then(
      console.log("finish insert")
  )
}
