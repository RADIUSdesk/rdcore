# Geocoder and Search plugin

This is useful if you provide geocoding searches (by distance) in your pagination views or any listing for that matter.
The plugin used here is [friendsofcake/search](https://github.com/FriendsOfCake/search).

## Basic Usage

It is wise to cache the API results in the provided `GeocodedAddresses` Table for performance and API rate limit reasons.
Just make sure you added the table via Migrations plugin.

If we have a search form with a field `locality_search`, we can easily add some filters here for it:

```php
->callback('locality_search', [
    'callback' => function ($query, $args, $manager) {
        $GeocodedAddresses = TableRegistry::get('Geo.GeocodedAddresses');
        $address = $GeocodedAddresses->retrieve($args['locality_search']);
        if ($address && $address->lat && $address->lng) {
            $query->find('distance', [
                'lat' => $address->lat,
                'lng' => $address->lng,
                'tableName' => 'Events',
                'distance' => 100,
                'sort' => false
            ]);
        }
    }
]);
```

The table name is only relevant if the geocoding fields is on a belongsTo relation (here Participants belongsTo Event).
