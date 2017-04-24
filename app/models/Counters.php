<?php

//namespace RestApi\Api\Models;
use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Counters extends Model
{
    public  $id;
    public  $calendar_id;
    public  $day;
    public  $type_id;
    public  $value;
    private $created;
    private $modified;

    public function initialize() {
        $this->belongsTo("calendar_id", "Calendar", "id");
        $this->belongsTo("type_id", "Countertypes", "id");
    }


    public function beforeCreate() {
        $this->created = date('Y-m-d H:i:s');
        $this->modified = date('Y-m-d H:i:s');
    }

    public function beforeUpdate() {
        $this->modified = date('Y-m-d H:i:s');
    }

}
