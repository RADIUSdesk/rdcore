<?php
/**
 * @var \App\View\AppView $this
 * @var \Geo\Model\Entity\GeocodedAddress $geocodedAddress
 */
?>
<nav class="actions large-3 medium-4 columns col-sm-4 col-xs-12" id="actions-sidebar">
    <ul class="side-nav nav nav-pills nav-stacked">
        <li class="heading"><?= __('Actions') ?></li>
        <li><?= $this->Form->postLink(
                __('Delete'),
                ['action' => 'delete', $geocodedAddress->id],
                ['confirm' => __('Are you sure you want to delete # {0}?', $geocodedAddress->id)]
            )
        ?></li>
        <li><?= $this->Html->link(__('List Geocoded Addresses'), ['action' => 'index']) ?></li>
    </ul>
</nav>
<div class="content action-form form large-9 medium-8 columns col-sm-8 col-xs-12">
	<h1><?= __('Edit Geocoded Address') ?></h1>
    <?= $this->Form->create($geocodedAddress) ?>
    <fieldset>
        <legend><?= __('Edit Geocoded Address') ?></legend>
        <?php
            echo $this->Form->control('address');
            echo $this->Form->control('formatted_address');
            echo $this->Form->control('country');
            echo $this->Form->control('lat');
            echo $this->Form->control('lng');
        ?>
    </fieldset>
    <?= $this->Form->button(__('Submit')) ?>
    <?= $this->Form->end() ?>
</div>
