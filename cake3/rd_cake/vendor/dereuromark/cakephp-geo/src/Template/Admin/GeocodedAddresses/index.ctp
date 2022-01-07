<?php
/**
 * @var \App\View\AppView $this
 * @var \Geo\Model\Entity\GeocodedAddress[]|\Cake\Collection\CollectionInterface $geocodedAddresses
 */

use Cake\Core\Plugin; ?>
<nav class="actions large-3 medium-4 columns col-sm-4 col-xs-12" id="actions-sidebar">
    <ul class="side-nav nav nav-pills nav-stacked">
        <li class="heading"><?= __('Actions') ?></li>
		<li><?= $this->Html->link(__('Overview'), ['controller' => 'Geo', 'action' => 'index']) ?></li>
        <li><?= $this->Form->postLink(__('Clear empty Geocoded Addresses'), ['action' => 'clearEmpty'], ['confirm' => 'Sure?']) ?></li>
		<li><?= $this->Form->postLink(__('Clear all Geocoded Addresses'), ['action' => 'clearAll'], ['confirm' => 'Sure?']) ?></li>
    </ul>
</nav>
<div class="content action-index index large-9 medium-8 columns col-sm-8 col-xs-12">
    <h1><?= __('Geocoded Addresses') ?></h1>
    <table class="table table-striped">
        <thead>
            <tr>
                <th><?= $this->Paginator->sort('address') ?></th>
                <th><?= $this->Paginator->sort('formatted_address') ?></th>
                <th><?= $this->Paginator->sort('country') ?></th>
                <th><?= $this->Paginator->sort('lat') ?></th>
                <th><?= $this->Paginator->sort('lng') ?></th>
                <th class="actions"><?= __('Actions') ?></th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($geocodedAddresses as $geocodedAddress): ?>
            <tr>
                <td><?= h($geocodedAddress->address) ?></td>
                <td><?= h($geocodedAddress->formatted_address) ?></td>
                <td><?= h($geocodedAddress->country) ?></td>
                <td><?= $this->Number->format($geocodedAddress->lat) ?></td>
                <td><?= $this->Number->format($geocodedAddress->lng) ?></td>
                <td class="actions">
                <?= $this->Html->link(Plugin::isLoaded('Tools') ? $this->Format->icon('view') : __('View'), ['action' => 'view', $geocodedAddress->id], ['escapeTitle' => false]); ?>
                <?= $this->Html->link(Plugin::isLoaded('Tools') ? $this->Format->icon('edit') : __('Edit'), ['action' => 'edit', $geocodedAddress->id], ['escapeTitle' => false]); ?>
                <?= $this->Form->postLink(Plugin::isLoaded('Tools') ? $this->Format->icon('delete') : __('Delete'), ['action' => 'delete', $geocodedAddress->id], ['escapeTitle' => false, 'confirm' => __('Are you sure you want to delete # {0}?', $geocodedAddress->id)]); ?>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <?php echo Plugin::isLoaded('Tools') ? $this->element('Tools.pagination') : $this->element('pagination'); ?>
</div>
