<?php

namespace Geo\Controller\Admin;

use App\Controller\AppController;
use Cake\ORM\Table;

/**
 * Overview:
 * All geocoding test and specific cache invalidation.
 *
 * @property \Geo\Model\Table\GeocodedAddressesTable $GeocodedAddresses
 */
class GeoController extends AppController {

	/**
	 * @var string
	 */
	public $modelClass = 'Geo.GeocodedAddresses';

	/**
	 * @return void
	 */
	public function index() {
		$Table = new Table();
		$schema = [
		];
		$Table->setSchema($schema);

		$entity = $Table->newEntity();
		$entity->geocoded = false;

		$Table->addBehavior('Geo.Geocoder', ['address' => 'address', 'on' => 'beforeMarshal']);

		if ($this->request->is('post')) {
			$geocodedAddress = $this->GeocodedAddresses->find()->where(['address' => $this->request->getData('address')])->first();
			if ($geocodedAddress && $this->request->getData('reset_cache')) {
				$this->GeocodedAddresses->deleteOrFail($geocodedAddress);
				$geocodedAddress = null;
			}

			$entity = $Table->patchEntity($entity, $this->request->getData());

			$entity->geocoded = true;
			$entity->geocoded_address = $geocodedAddress;

			if (!$geocodedAddress) {
				$geocodedAddress = $this->GeocodedAddresses->find()->where(['address' => $this->request->getData('address')])->first();
				$entity->geocoded_address_created = $geocodedAddress;
			}
		}

		$this->set(compact('entity'));
	}

}
