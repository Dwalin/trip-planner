<?php

//namespace RestApi\Api\Models;
use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Calendar extends Model
{
    public $id;
    public $name;
    private $created;
    private $modified;

    public function initialize()
    {

        $this->hasManyToMany(
            "id",
            "Userbinding",
            "calendar_id", "user_id",
            "Users",
            "id"
        );

        $this->hasMany(
            "id",
            "Userbinding",
            "calendar_id"
        );

        $this->hasMany(
            "id",
            "Notes",
            "calendar_id"
        );

        $this->hasMany(
            "id",
            "Counters",
            "calendar_id"
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
