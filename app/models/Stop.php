<?php

//namespace RestApi\Api\Models;
use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Stop extends Model
{
    public $id;
    public $name;
    public $location;
    public $trip_id;
    private $created;
    private $modified;

    public function initialize() {


        $this->belongsTo(
            "trip_id",
            "Trip",
            "id"
        );

        $this->hasMany(
            "id",
            "Day",
            "stop_id"
        );

    }


    public function beforeCreate() {
        $this->created = date('Y-m-d H:i:s');
        $this->modified = date('Y-m-d H:i:s');
    }

    public function beforeUpdate() {
        $this->modified = date('Y-m-d H:i:s');
    }

}
