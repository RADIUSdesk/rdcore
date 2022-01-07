<?php

namespace Geo\Controller\Admin;

use App\Controller\AppController;

/**
 * GeocodedAddresses Controller
 *
 * @property \Geo\Model\Table\GeocodedAddressesTable $GeocodedAddresses
 *
 * @method \Geo\Model\Entity\GeocodedAddress[]|\Cake\Datasource\ResultSetInterface paginate($object = null, array $settings = [])
 */
class GeocodedAddressesController extends AppController {

	/**
	 * Index method
	 *
	 * @return \Cake\Http\Response|null
	 */
	public function index() {
		$geocodedAddresses = $this->paginate($this->GeocodedAddresses);

		$this->set(compact('geocodedAddresses'));
	}

	/**
	 * View method
	 *
	 * @param string|null $id Geocoded Address id.
	 * @return \Cake\Http\Response|null
	 * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
	 */
	public function view($id = null) {
		$geocodedAddress = $this->GeocodedAddresses->get($id, [
			'contain' => [],
		]);

		$this->set('geocodedAddress', $geocodedAddress);
	}

	/**
	 * @return \Cake\Http\Response
	 */
	public function clearEmpty() {
		$this->request->allowMethod('post');

		$this->GeocodedAddresses->clearEmpty();

		$this->Flash->success(__('The empty geocoded addresses have been removed from cache.'));

		return $this->redirect(['action' => 'index']);
	}

	/**
	 * @return \Cake\Http\Response
	 */
	public function clearAll() {
		$this->request->allowMethod('post');

		$this->GeocodedAddresses->clearAll();

		$this->Flash->success(__('All geocoded addresses have been removed from cache'));

		return $this->redirect(['action' => 'index']);
	}

	/**
	 * Edit method
	 *
	 * @param string|null $id Geocoded Address id.
	 * @return \Cake\Http\Response|null Redirects on successful edit, renders view otherwise.
	 * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
	 */
	public function edit($id = null) {
		$geocodedAddress = $this->GeocodedAddresses->get($id, [
			'contain' => [],
		]);
		if ($this->request->is(['patch', 'post', 'put'])) {
			$geocodedAddress = $this->GeocodedAddresses->patchEntity($geocodedAddress, $this->request->getData());
			if ($this->GeocodedAddresses->save($geocodedAddress)) {
				$this->Flash->success(__('The geocoded address has been saved.'));

				return $this->redirect(['action' => 'index']);
			}
			$this->Flash->error(__('The geocoded address could not be saved. Please, try again.'));
		}
		$this->set(compact('geocodedAddress'));
	}

	/**
	 * Delete method
	 *
	 * @param string|null $id Geocoded Address id.
	 * @return \Cake\Http\Response|null Redirects to index.
	 * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
	 */
	public function delete($id = null) {
		$this->request->allowMethod(['post', 'delete']);
		$geocodedAddress = $this->GeocodedAddresses->get($id);
		if ($this->GeocodedAddresses->delete($geocodedAddress)) {
			$this->Flash->success(__('The geocoded address has been deleted.'));
		} else {
			$this->Flash->error(__('The geocoded address could not be deleted. Please, try again.'));
		}

		return $this->redirect(['action' => 'index']);
	}

}
