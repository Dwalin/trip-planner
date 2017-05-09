<?php

//namespace RestApi\Api\Models;
use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Trip extends Model
{
    public $id;
    public $title;
    private $created;
    private $modified;

    public function initialize() {

        $this->hasManyToMany(
            "id",
            "Userbinding",
            "trip_id", "user_id",
            "Users",
            "id"
        );

        $this->hasMany(
            "id",
            "Stop",
            "trip_id"
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
