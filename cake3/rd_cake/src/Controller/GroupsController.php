<?php

namespace App\Controller;

/**
 * Groups Controller
 *
 * @property Group $Group
 */
class GroupsController extends AppController {

    public function initialize()
    {
        parent::initialize();
        $this->loadModel('Groups');
    }
/**
 * index method
 *
 * @return void
 */
	public function index() {
//		$this->Groups->recursive = 0;
		$this->set('groups', $this->paginate());
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
		if (! $this->Groups->find()->where(['Groups.id' => $id])->exists()) {
			throw new NotFoundException(__('Invalid group'));
		}
		$this->set('group', $this->Groups->find()->where(['Groups.id' => $id])->first());
	}

/**
 * add method
 *
 * @return void
 */
	public function add() {
		if ($this->request->is('post')) {
			$groupEntity = $this->Groups->newEntity($this->request->getData());

			if ($this->Groups->save($groupEntity)) {
				$this->Flash->set(__('The group has been saved'));
				$this->redirect(['action' => 'index']);
			} else {
				$this->Flash->set(__('The group could not be saved. Please, try again.'));
			}
		}
	}

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function edit($id = null) {
		if (! $this->Groups->find()->where(['Groups.id' => $id])->exists()) {
			throw new NotFoundException(__('Invalid group'));
		}
		if ($this->request->is('post') || $this->request->is('put')) {
            $groupEntity = $this->Groups->newEntity($this->request->getData());

            if ($this->Groups->save($groupEntity)) {
				$this->Flash->set(__('The group has been saved'));
				$this->redirect(['action' => 'index']);
			} else {
				$this->Flash->set(__('The group could not be saved. Please, try again.'));
			}
		} else {
			$this->request->data = $this->Groups->find()->where(['Groups.id' => $id])->first();
		}
	}

/**
 * delete method
 *
 * @throws MethodNotAllowedException
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function delete($id = null) {
		if (! $this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

		if (! $this->Groups->find()->where(['Groups.id' => $id])->exists()) {
			throw new NotFoundException(__('Invalid group'));
		}
        if ($this->Groups->query()->delete()->where(['Groups.id' => $id])->execute()) {
			$this->Flash->set(__('Group deleted'));
			$this->redirect(['action' => 'index']);
		}
		$this->Flash->set(__('Group was not deleted'));
		$this->redirect(['action' => 'index']);
	}
}
