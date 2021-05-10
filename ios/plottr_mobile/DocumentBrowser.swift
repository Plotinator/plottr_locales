//
//  DocumentBrowser.swift
//  plottr_mobile
//
//  Created by Cameron Sutter on 8/17/20.
//

import UIKit

@objc(DocumentBrowser)
class DocumentBrowserViewController: UIDocumentBrowserViewController, UIDocumentBrowserViewControllerDelegate {
  
  @objc static func requiresMainQueueSetup() -> Bool {
      return true
  }

  override func viewDidLoad() {
    super.viewDidLoad()

    delegate = self

    allowsDocumentCreation = true
    allowsPickingMultipleItems = false
    shouldShowFileExtensions = false
    localizedCreateDocumentActionTitle = "New Project"

    // Update the style of the UIDocumentBrowserViewController
    //  browserUserInterfaceStyle = .dark
    view.tintColor = .orange
  }
  
  @objc func openBrowser() -> Void {
    DispatchQueue.main.async {
      let appDelegate = UIApplication.shared.delegate as! AppDelegate
      appDelegate.openDocumentBrowser()
    }
  }
  
  @objc func closeBrowser() -> Void {
    DispatchQueue.main.async {
      let appDelegate = UIApplication.shared.delegate as! AppDelegate
      appDelegate.closeDocumentBrowser()
    }
  }
  
  // MARK: UIDocumentBrowserViewControllerDelegate

  func documentBrowser(_ controller: UIDocumentBrowserViewController, didRequestDocumentCreationWithHandler importHandler: @escaping (URL?, UIDocumentBrowserViewController.ImportMode) -> Void) {
    
//    print("IN DOCUMENT BROWSER: didRequestDocumentCreationWithHandler")
    // Make sure the importHandler is always called, even if the user cancels the creation request.
    let alert = UIAlertController(title: "What is the project's name?", message: nil, preferredStyle: .alert)
    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: { _ in
      importHandler(nil, .none)
    }))

    alert.addTextField(configurationHandler: { textField in
      textField.placeholder = "Project name..."
    })

    alert.addAction(UIAlertAction(title: "OK", style: .default, handler: { action in

      if let name = alert.textFields?.first?.text {

        let fileManager = FileManager.default
        var documentDirectory = URL(fileURLWithPath: "")
        do {
          documentDirectory = try fileManager.url(for: .documentDirectory, in: .userDomainMask, appropriateFor:nil, create:false)
        } catch {
          print("error getting document directory")
          importHandler(nil, .none)
        }

        var escapedFileName = name.replacingOccurrences(of: " ", with: "_")
        escapedFileName = "\(escapedFileName).pltr"

        let fileURL = documentDirectory.appendingPathComponent(escapedFileName)

        let doc = PlottrDocument(fileURL: fileURL)
        DocumentViewController._sharedInstance?.document = doc
        let basicJSON = "{\"storyName\":\"\(name)\", \"newFile\":true}"
        doc.updateStringContents(data: basicJSON)
        doc.save(to: fileURL, for: .forCreating, completionHandler: { (saved) in
          self.presentDocument(at: fileURL, json: basicJSON)
          importHandler(fileURL, .move)
        })
      } else { importHandler(nil, .none) }
    }))

    self.present(alert, animated: true)
  }
  
  func documentBrowser(_ controller: UIDocumentBrowserViewController, didPickDocumentsAt documentURLs: [URL]) {
//    print("didPickDocumentsAt")
    guard let sourceURL = documentURLs.first else { return }
//    print(sourceURL.absoluteString)
    
    let doc = PlottrDocument(fileURL: sourceURL)
    DocumentViewController._sharedInstance?.document = doc
//    print("picked:", DocumentViewController._sharedInstance?.document)
    
    // Access the document
    doc.open(completionHandler: { (success) in
      if success {
        // Display the content of the document
        self.presentDocument(at: sourceURL, json: doc.stringContents())

      } else {
        // Make sure to handle the failed import appropriately, e.g., by presenting an error message to the user.
        print("failed to open file")
      }
    })
  }
  
  // MARK: Document Presentation

  func presentDocument(at documentURL: URL, json: String) {
    let initialData:NSDictionary = [
      "documentURL": documentURL.path,
      "data": json
    ]
    DocEvents.openDocument(data: initialData)
  }
  
  func closeDocument() {
    self.view.willRemoveSubview(DocumentViewController.sharedInstance()!.view)
    DocumentViewController.sharedInstance()?.removeFromParent()
  }
}
