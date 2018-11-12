
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('events').del()
    .then(function () {
      // Inserts seed entries
      return knex('events').insert([
        {
          kind: 'opening',
          starts_at: new Date('2014-08-04 09:30'),
          ends_at: new Date('2014-08-04 12:30'),
          weekly_recurring: true,
        },
        {
          kind: 'appointment',
          starts_at: new Date('2014-08-11 10:30'),
          ends_at: new Date('2014-08-11 11:30'),
        },
      ]);
    });
};
