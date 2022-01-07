<?php
/**
 * @var \App\View\AppView $this
 * @var \Geo\Model\Entity\GeocodedAddress $geocodedAddress
 */
?>
<nav class="actions large-3 medium-4 columns col-sm-4 col-xs-12" id="actions-sidebar">
    <ul class="side-nav nav nav-pills nav-stacked">
        <li class="heading"><?= __('Actions') ?></li>
        <li><?= $this->Html->link(__('Edit Geocoded Address'), ['action' => 'edit', $geocodedAddress->id]) ?> </li>
        <li><?= $this->Form->postLink(__('Delete Geocoded Address'), ['action' => 'delete', $geocodedAddress->id], ['confirm' => __('Are you sure you want to delete # {0}?', $geocodedAddress->id)]) ?> </li>
        <li><?= $this->Html->link(__('List Geocoded Addresses'), ['action' => 'index']) ?> </li>
    </ul>
</nav>
<div class="content action-view view large-9 medium-8 columns col-sm-8 col-xs-12">
    <h1><?= h($geocodedAddress->address) ?></h1>
    <table class="table vertical-table">
        <tr>
            <th><?= __('Formatted Address') ?></th>
            <td><?= h($geocodedAddress->formatted_address) ?></td>
        </tr>
        <tr>
            <th><?= __('Country') ?></th>
            <td><?= h($geocodedAddress->country) ?></td>
        </tr>
        <tr>
            <th><?= __('Lat') ?></th>
            <td><?= $this->Number->format($geocodedAddress->lat) ?></td>
        </tr>
        <tr>
            <th><?= __('Lng') ?></th>
            <td><?= $this->Number->format($geocodedAddress->lng) ?></td>
        </tr>
        <tr>
            <th><?= __('Data') ?></th>
            <td><?= $geocodedAddress->data ? '<pre>' . h(print_r($geocodedAddress->data->toArray(), true)) . '</pre>' : '-' ?></td>
        </tr>
		<tr>
			<th><?= __('Created') ?></th>
			<td><?= $this->Time->nice($geocodedAddress->created) ?></td>
		</tr>
    </table>

</div>
