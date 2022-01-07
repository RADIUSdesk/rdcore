<?php

namespace App\Controller\Component;

use Cake\Controller\Component;

class GridFilterComponent extends Component {

    /*INFO: We created this Component when we did the upgrade from ExtJs 4 to ExtJs 6 in order to fix the filter on the grids
    //In version 4 the filter was in the form: (object with the following properties 
        -> type [date|string|boolean] 
        -> value (for string and boolean)
        -> comparison (for date)
        -> value
        -> field
    In version 6 the filter change COMPLETELY and we now have:
        -> operator (Based on the value of the Operator, we will specify the type which in now not present any more)
        -> property (This now contains the field)
        -> value
    
    We use the following rules when looking at the value of operator to decide the type that will be used:
        like => string; = => boolean; gt,lt,eq => date
    */

    public function xformFilter($f){
    
        if(property_exists($f, 'operator')){
        
            if($f->operator == 'like'){
                $f->type = 'string';
            }
            
            if($f->operator == '='){
                $f->type = 'boolean';
            }

            if($f->operator == 'in'){
                $f->type = 'list';
            }
            
            if(($f->operator == 'gt')||($f->operator == 'lt')||($f->operator == 'eq')){
                $f->type = 'date';
                $f->comparison = $f->operator;
            }
        
        }
        
        if(property_exists($f, 'property')){
            $f->field = $f->property; 
        }
      
        return $f;
    } 
}
