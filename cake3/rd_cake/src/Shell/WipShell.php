<?php

//as www-data
//cd /var/www/html/cake3/rd_cake && bin/cake wip


namespace App\Shell;

use Cake\Console\Shell;

class WipShell extends Shell{

    public $tasks = [];

    public function initialize(){
        parent::initialize();
        $this->loadModel('Nodes');
        $this->loadModel('Meshes');   
    }

    public function main(){
        $this->out("Specify something");
        $this->removeEmptyMeshes();
    }
    
    public function removeEmptyMeshes(){
        $this->out("Delete Empty Meshes");
        $ent_list = $this->{'Meshes'}->find()->all();
        //$ent_list = $this->{'Meshes'}->find()->limit(2000)->all();
        foreach($ent_list as $ent){
            $node_count = $this->{'Nodes'}->find()->where(['Nodes.mesh_id' => $ent->id])->count();
            if($node_count == 0){
                $this->out("<info>EMPTY - Need To Delete MESH $ent->name </info>");
                $e = $this->{'Meshes'}->find()->where(['Meshes.id' => $ent->id])->first();
                $this->{'Meshes'}->delete($e);
            }else{    
                $this->out("<info>NOT EMPTY - MESH $ent->name has $node_count nodes </info>");
            } 
        } 
    }
}

?>
