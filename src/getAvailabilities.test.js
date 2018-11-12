import knex from 'knexClient'
import getAvailabilities, {createTab, feedTab} from './getAvailabilities';

describe('getAvailabilities', () => {
  beforeEach(() => knex('events').truncate())

  describe('test local functions', () => {
    beforeEach(async () => {
      await knex('events').insert([
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
      ])
    })

    it('should create a correct tab', () => {
      const tab = createTab(7)
      expect(tab.length).toBe(7)
      expect(tab[0].length).toBe(24 * 2)
    });

    it('should feed the tab correctly', async () => {
      const tab = createTab(7)
      await feedTab(tab, new Date('2014-08-10'), new Date('2014-08-17'))
      expect(tab[0][18]).toBe(0)
      expect(tab[0][19]).toBe(0)
      expect(tab[0][20]).toBe(0)
      expect(tab[0][21]).toBe(0)
      expect(tab[0][22]).toBe(0)
      expect(tab[0][23]).toBe(0)
      expect(tab[0][24]).toBe(0)
      expect(tab[0][25]).toBe(0)

      expect(tab[1][18]).toBe(0)
      expect(tab[1][19]).toBe(1)
      expect(tab[1][20]).toBe(1)
      expect(tab[1][21]).toBe(2)
      expect(tab[1][22]).toBe(2)
      expect(tab[1][23]).toBe(1)
      expect(tab[1][24]).toBe(1)
      expect(tab[1][25]).toBe(0)
    })

    it('should trow an error because the date is invalid', async () => {
      try {
        await getAvailabilities(new Date('2014-42-42'))
      } catch (e) {
        console.log(e.toString())
        expect(e.toString()).toBe('Invalid parameter date.')
      }
    })
  })

  describe('simple case', () => {
    beforeEach(async () => {
      await knex('events').insert([
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
      ])
    })

    it('should fetch availabilities correctly', async () => {
      const availabilities = await getAvailabilities(new Date('2014-08-10'))
      expect(availabilities.length).toBe(7)

      expect(String(availabilities[0].date)).toBe(
        String(new Date('2014-08-10')),
      )
      expect(availabilities[0].slots).toEqual([])

      expect(String(availabilities[1].date)).toBe(
        String(new Date('2014-08-11')),
      )
      expect(availabilities[1].slots).toEqual([
        '9:30',
        '10:00',
        '11:30',
        '12:00',
      ])

      expect(availabilities[2].slots).toEqual([])

      expect(String(availabilities[6].date)).toBe(
        String(new Date('2014-08-16')),
      )
    })

  })

  describe('difficult case', () => {
    beforeEach(async () => {
      await knex('events').insert([
        {
          kind: 'opening',
          starts_at: new Date('2014-08-04 09:30'),
          ends_at: new Date('2014-08-04 12:30'),
          weekly_recurring: true,
        },
        {
          kind: 'opening',
          starts_at: new Date('2014-08-06 09:30'),
          ends_at: new Date('2014-08-06 12:30'),
          weekly_recurring: false,
        },
        {
          kind: 'opening',
          starts_at: new Date('2014-08-13 09:30'),
          ends_at: new Date('2014-08-13 12:30'),
          weekly_recurring: true,
        },
        {
          kind: 'opening',
          starts_at: new Date('2014-08-20 09:30'),
          ends_at: new Date('2014-08-20 12:30'),
          weekly_recurring: true,
        },
        {
          kind: 'appointment',
          starts_at: new Date('2014-08-11 10:30'),
          ends_at: new Date('2014-08-11 11:30'),
        },
        {
          kind: 'appointment',
          starts_at: new Date('2014-08-06 10:30'),
          ends_at: new Date('2014-08-06 11:30'),
          weekly_recurring: true
        },
      ])
    })

    it('should fetch availabilities correctly', async () => {
      const availabilities = await getAvailabilities(new Date('2014-08-10'))
      expect(availabilities.length).toBe(7)

      expect(availabilities[0].slots).toEqual([
      ])
      expect(availabilities[1].slots).toEqual([
        '9:30',
        '10:00',
        '11:30',
        '12:00',
      ])
      expect(availabilities[2].slots).toEqual([
      ])
      expect(availabilities[3].slots).toEqual([
        '9:30',
        '10:00',
        '11:30',
        '12:00',
      ])
    })

  })
})
