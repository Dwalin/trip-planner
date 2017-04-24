<?php


//namespace RestApi\Api\Controllers;

use Phalcon\Mvc\Controller;
use Phalcon\Http\Response;
use Phalcon\Http\Request;


class IndexController extends RestController {

    /**
     * @Post("/api/users/login")
     */
    public function loginAction() {
        $response = new Response();
        $request = $this->request->getPost();

        $email       = $this->request->getPost('email');
        $password    = $this->request->getPost('password');


        $user = Users::findFirstByEmail($email);

        //print_r($password);
        //print_r($user->password);
        //print_r($user->password);

        if ($user) {
            if ($this->security->checkHash($password, $user->password)) {
                $response->setStatusCode(201, "Success");
                $response->setJsonContent(
                    array(
                        'status' => 'OK',
                        'action' => 'logged',
                        'data'   => $user
                    )
                );

                //var_dump($_COOKIE);

                setcookie("user", $user->toArray());
                $this->session->set("user", $user->toArray());

            } else {
                // Change the HTTP status
                $response->setStatusCode(409, "Conflict");

                // Send errors to the client
                $response->setJsonContent(
                    array(
                        'status'   => 'WRONG PASSWORD',
                    )
                );

            }

        } else {
            // Change the HTTP status
            $response->setStatusCode(404, "Not found");

            // Send errors to the client
            $response->setJsonContent(
                array(
                    'status'   => 'NO SUCH USER',
                )
            );
        }

        return $response;

    }

    /**
     * @Get("/api/users/logout")
     */
    public function logoutAction() {
        $response = new Response();

        setcookie("user", '');
        $this->session->destroy();

        $response->setStatusCode(201, "Success");
        $response->setJsonContent(
            array(
                'status' => 'OK',
                'action' => 'logged out',
            )
        );

        return $response;

    }

    /**
     * @Get("/api/users/current")
     */
    public function currentUserAction() {

        $userId = $this->session->get("user")['id'];
        $user = Users::findFirst(
            array(
                "id = '$userId'",
                "columns" => "id, name"
            )
        );

        $this->response->setJsonContent(
            $user->toArray('name', 'id')
        );

        return $response;

    }

    /**
     * @Get("/api/calendar/")
     */
    public function calendarAction() {

        $userId = $this->session->get("user")['id'];
        $user = Users::findFirst($userId);

        $calendar = $user->getCalendar();

//        $notes = $calendar->getNotes();
//        echo $calendar->id;

        $notes = Notes::find([
            "calendar_id = :id:",
            "bind" => [
                "id" => $calendar->toArray()[0]["id"]
            ]
        ]);

        $notes = $notes->toArray();

        foreach ($notes as $keyA => $noteA) {
            foreach ($notes as $keyB => $noteB) {
                if ($noteA != $noteB) {
                    if ($noteA['day'] == $noteB['day']) {
                        if (strtotime($noteA['created']) > strtotime($noteB['created'])) {
                            unset($notes[$keyB]);
                        };
                    };
                }

            }
        }

        $processedNotes = array();
        $counters = array();

        foreach ($notes as $note) {
            $processedNotes[] = $note;
            if ($note["counter"]) {
                $counters[] = array($note["day"], $note["counter"]);
            }
        }



        $this->response->setJsonContent(
            array(
                'notes'   => $processedNotes,
                'counters'   => $counters,
                'calendar' => $calendar->toArray()
            )

        );

        return $response;

    }

    /**
     * @Get("/api/users/")
     */
    public function usersAction() {

        $response = new Response();

        $users = Users::find(array(
            "columns" => "id, email"
                             ));
        $users->rewind();

        while ($users->valid()) {
            $user[] = $users->current()->toArray();
            $users->next();
        }

        $response->setStatusCode(201, "Success");
        $response->setJsonContent(
            array(
                'status' => 'OK',
                'action' => 'found',
                'data'   => $user
            )
        );

        return $response;

    }

    /**
     * @Post("/api/calendar/")
     */
    public function noteAddAction() {

        $response = new Response();
        $request = $this->request->getPost();

        $userId = $this->session->get("user")['id'];
        $user = Users::findFirst($userId);

        $calendar = $user->getCalendar();

        $note = Notes::findFirst([
            "day = " . $this->request->getPost('day') . " AND calendar_id = " . $calendar->toArray()[0]["id"]
        ]);


        if ($note) {
            $note -> note          = $this->request->getPost('note');
        } else {
            $note = new Notes();
            $note -> day           = $this->request->getPost('day');
            $note -> note          = $this->request->getPost('note');
            $note -> calendar_id   = $calendar->toArray()[0]["id"];
        }

        if ($note->save() == true) {
            $response->setStatusCode(201, "Success");
            $response->setJsonContent(
                array(
                    'status' => 'OK',
                    'action' => 'created',
                    'data'   => $note
                )
            );
        } else {
            // Change the HTTP status
            $response->setStatusCode(409, "Conflict");

            // Send errors to the client
            $errors = array();
            foreach ($note->getMessages() as $message) {
                $errors[] = $message->getMessage();
            }

            $response->setJsonContent(
                array(
                    'status'   => 'ERROR',
                    'messages' => $errors,
                    'calendar' => $calendar->toArray()
                )
            );
        }

        return $response;

    }

    /**
     * @Post("/api/calendar/counter/")
     */
    public function noteCounterAction() {

        $response = new Response();
        $request = $this->request->getPost();

        $userId = $this->session->get("user")['id'];
        $user = Users::findFirst($userId);

        $calendar = $user->getCalendar();

        $note = Notes::findFirst([
            "day = " . $this->request->getPost('day') . " AND calendar_id = " . $calendar->toArray()[0]["id"]
        ]);

        if ($note) {
            $note -> counter       = $this->request->getPost('counter');
        } else {
            $note = new Notes();
            $note -> day           = $this->request->getPost('day');
            $note -> counter       = $this->request->getPost('counter');
            $note -> calendar_id   = $calendar->toArray()[0]["id"];
        }

        if ($note->save() == true) {
            $response->setStatusCode(201, "Success");
            $response->setJsonContent(
                array(
                    'status' => 'OK',
                    'action' => 'Added a counter',
                    'data'   => $note
                )
            );
        } else {
            // Change the HTTP status
            $response->setStatusCode(409, "Conflict");

            // Send errors to the client
            $errors = array();
            foreach ($note->getMessages() as $message) {
                $errors[] = $message->getMessage();
            }

            $response->setJsonContent(
                array(
                    'status'   => 'ERROR',
                    'messages' => $errors,
                    'calendar' => $calendar->toArray()
                )
            );
        }

        return $response;

    }

    /**
     * @Post("/api/users/register")
     */
    public function registerAction() {
        $response = new Response();
        $request = $this->request->getPost();

        $user = new Users();

//        $user->login        = $this->request->getPost('login');
//        $user->name        = $this->request->getPost('name');
        $user->email       = $this->request->getPost('email');
        $user->password    = $this->security->hash($this->request->getPost('password'));

        $calendar = new Calendar();
        $calendar -> name = $this->request->getPost('email');

        $userbinding = new Userbinding();
        $userbinding->Users = $user;
        $userbinding->Calendar = $calendar;

        if ($userbinding->create() == true) {
            $response->setStatusCode(201, "Success");
            $response->setJsonContent(
                array(
                    'status' => 'OK',
                    'action' => 'created',
                    'data'   => $user
                )
            );
        } else {
            // Change the HTTP status
            $response->setStatusCode(409, "Conflict");

            // Send errors to the client
            $errors = array();
            foreach ($userbinding->getMessages() as $message) {
                $errors[] = $message->getMessage();
            }

            $response->setJsonContent(
                array(
                    'status'   => 'ERROR',
                    'messages' => $errors
                )
            );
        }

        return $response;

    }



    // Counters

    /**
     * @Get("/api/calendar/counters/")
     */
    public function countersGetAction() {

        $response = new Response();

        $userId = $this->session->get("user")['id'];
        $user = Users::findFirst($userId);
        $calendar = $user->getCalendar();

        $counters = Counters::find([
            "calendar_id = :calendar_id:",
            "bind" => [
                "calendar_id" => $calendar->toArray()[0]["id"]
            ],
            "order" => "day DESC"
        ]);

        $counters = $counters -> toArray();

        if ($counters) {
            $response->setStatusCode(201, "Success");

            $processed = array();

            foreach ($counters as $key => $counter) {
                $type = Countertypes::findFirst($counter["type_id"]);
                $counters[$key]["type"] = $type->toArray()["name"];
                unset($counters[$key]["type_id"]);
                unset($counters[$key]["created"]);
                unset($counters[$key]["modified"]);
                unset($counters[$key]["calendar_id"]);
                unset($counters[$key]["id"]);

                $processed[$counters[$key]["type"]][] = array(
                    "day" => $counters[$key]["day"],
                    "value" => $counters[$key]["value"]
                );


            }

            $response->setJsonContent($processed);

        } else {
            $response->setStatusCode(404, "Not found");
            $response->setJsonContent(
                array(
                    'status'     => 'Not found'
                )
            );
        }


        return $response;
    }


    /**
     * @Post("/api/calendar/counters/")
     */
    public function countersAddAction() {

        $response = new Response();
        $request = $this->request->getPost();

        $userId = $this->session->get("user")['id'];
        $user = Users::findFirst($userId);

        $calendar = $user->getCalendar();


        $type = Countertypes::findFirstByName($this->request->getPost('name'));

        if ($type) {
            // If such type exists...
            $counter = Counters::findFirst([
                "type_id = :type_id: AND day = :day: AND calendar_id = :calendar_id:",
                "bind" => [
                    "type_id"     => $type->toArray()[0]["id"],
                    "day"         => $request['day'],
                    "calendar_id" => $calendar->toArray()[0]["id"]
                ]
            ]);
        } else {
            // Or we need to create one
            $type = new Countertypes();
            $type -> name             = $this->request->getPost('name');
        }


        if ($counter) {
            // Updating counter value...
            $counter -> value         = $this->request->getPost('value');
        } else {
            // Or creating new one
            $counter = new Counters();
            $counter -> day           = $request['day'];
            $counter -> value         = $request['value'];
            $counter -> calendar_id   = $calendar->toArray()[0]["id"];

            $counter -> Countertypes  = $type;
        }

//        die(var_dump($counter->save() ));

        if ($counter->save() == true) {

            $response->setStatusCode(201, "Success");
            $response->setJsonContent(
                array(
                    'status' => 'OK',
                    'action' => 'created',
                    'data'   => $counter -> toArray()
                )
            );

        } else {

            $response->setStatusCode(409, "Conflict");

            $errors = array();
            foreach ($counter->getMessages() as $message) {
                $errors[] = $message->getMessage();
            }

            $response->setJsonContent(
                array(
                    'status'   => 'ERROR',
                    'messages' => $errors,
                    'calendar' => $calendar->toArray(),
                    'type'     => $type->toArray(),
                    'counter'  => $counter->toArray()
                )
            );
        }

        return $response;

    }


}